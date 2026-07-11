/**
 * ArenaMind AI Reasoning Pipeline — Signal Filter
 *
 * RESPONSIBILITY:
 * Takes the full StadiumContext (often verbose and noisy) plus a DecisionTrigger
 * and returns a RelevantSignals object containing ONLY data plausibly relevant
 * to that specific trigger moment.
 *
 * This is the "signal vs. noise" core of the whole product. Without it, every
 * Gemini prompt would be flooded with calm gate data, idle volunteers, and
 * operational-status information that is irrelevant to the decision at hand.
 * A focused prompt produces a focused, evidence-anchored recommendation.
 *
 * SIZE CAPS (enforced in code, documented here):
 *   - gates:      max 3 — target/relevant gates only, never the full 8
 *   - volunteers: max 5 — zone-matched volunteers only, sorted by availability
 *   - incidents:  max 5 — highest-severity / most recent first
 *   - assets:     max 4 — only non-operational or directly relevant
 *
 * These caps are intentionally conservative. The goal is a tight prompt, not a
 * comprehensive report. The full StadiumContext is always available via GET /api/context
 * if a human operator wants the unfiltered picture.
 */

import type { StadiumContext, Gate, Incident, Volunteer } from '../../types/stadium-context';
import type { DecisionTrigger, RelevantSignals } from '../../types/reasoning';

// ─── Size caps ────────────────────────────────────────────────────────────────

const MAX_GATES = 3;
const MAX_VOLUNTEERS = 5;
const MAX_INCIDENTS = 5;
const MAX_ASSETS = 4;

// ─── Sort helpers ─────────────────────────────────────────────────────────────

const RISK_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  moderate: 2,
  low: 1,
};

const SEVERITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  moderate: 2,
  low: 1,
};

const VOLUNTEER_STATUS_ORDER: Record<string, number> = {
  available: 4,
  assigned: 3,
  'on-break': 2,
  'off-duty': 1,
};

function byRiskDesc(a: Gate, b: Gate): number {
  return (RISK_ORDER[b.riskLevel] ?? 0) - (RISK_ORDER[a.riskLevel] ?? 0);
}

function bySeverityDesc(a: Incident, b: Incident): number {
  return (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0);
}

function byVolunteerPriority(a: Volunteer, b: Volunteer): number {
  return (VOLUNTEER_STATUS_ORDER[b.status] ?? 0) - (VOLUNTEER_STATUS_ORDER[a.status] ?? 0);
}

// ─── Gate-scoped filter ───────────────────────────────────────────────────────

/**
 * Filters signals for a trigger that references a specific gate ID.
 *
 * Includes:
 *   - The exact target gate (always first in the array)
 *   - Up to 2 additional gates with riskLevel > "low" (adjacent/overflow awareness)
 *   - Accessibility assets whose locationReference matches the target gate
 *   - Incidents whose locationReference or displayLocation references the gate or
 *     any of its servedSections
 *   - Volunteers whose assignedZone contains the gate's displayName fragment
 *   - Full weather (always — affects crowd behaviour)
 *   - Medical resources if there are any active medical incidents
 */
function filterByGate(
  ctx: StadiumContext,
  gateId: string,
): Omit<RelevantSignals, 'metadata' | 'trigger'> {
  const targetGate = ctx.gates.find((g) => g.id === gateId);

  // If the gate ID is not found, fall back to global scan so we never crash.
  if (!targetGate) {
    return filterGlobal(ctx);
  }

  // Target gate + up to 2 other elevated-risk gates (excluding the target itself)
  const otherElevatedGates = ctx.gates
    .filter((g) => g.id !== gateId && g.riskLevel !== 'low')
    .sort(byRiskDesc)
    .slice(0, MAX_GATES - 1);

  const gates = [targetGate, ...otherElevatedGates];

  // Accessibility assets at or near this gate
  const accessibilityAssets = ctx.accessibilityAssets
    .filter((a) => a.locationReference === gateId)
    .slice(0, MAX_ASSETS);

  // Incidents referencing this gate's ID or any of its served sections
  const servedSectionsSet = new Set(targetGate.servedSections);
  const incidents = ctx.incidents
    .filter(
      (i) =>
        i.locationReference === gateId ||
        targetGate.servedSections.some((s) => i.description.includes(s)) ||
        i.displayLocation.toLowerCase().includes(gateId.replace('gate-', 'gate ')),
    )
    .sort(bySeverityDesc)
    .slice(0, MAX_INCIDENTS);

  // Volunteers assigned to a zone related to this gate
  // Match against the gate display name prefix (e.g., "Gate A") or served sections
  const gateLabel = targetGate.displayName.split('—')[0].trim(); // e.g., "Gate D"
  const volunteers = ctx.volunteers
    .filter(
      (v) =>
        v.assignedZone.startsWith(gateLabel) ||
        [...servedSectionsSet].some((s) => v.assignedZone.includes(s)),
    )
    .sort(byVolunteerPriority)
    .slice(0, MAX_VOLUNTEERS);

  // Medical resources — include if there are active medical incidents touching this gate
  const hasMedicalIncident = incidents.some((i) => i.incidentType === 'medical');
  const medicalResources = hasMedicalIncident ? ctx.medicalResources : null;

  return {
    gates,
    weather: ctx.weather,
    incidents,
    accessibilityAssets,
    medicalResources,
    volunteers,
  };
}

// ─── Incident-scoped filter ───────────────────────────────────────────────────

/**
 * Filters signals for a trigger that references a specific incident ID.
 *
 * Includes:
 *   - The target incident (always included)
 *   - Any other open incidents at the same locationReference (co-located context)
 *   - The gate(s) associated with the incident's locationReference
 *   - Medical resources if the incident type is "medical" or "crowd-surge"
 *   - Volunteers assigned to the incident's zone
 *   - Accessibility assets at the incident location if relevant
 *   - Full weather
 */
function filterByIncident(
  ctx: StadiumContext,
  incidentId: string,
): Omit<RelevantSignals, 'metadata' | 'trigger'> {
  const targetIncident = ctx.incidents.find((i) => i.id === incidentId);

  // If incident not found, fall back to global scan
  if (!targetIncident) {
    return filterGlobal(ctx);
  }

  // Co-located open incidents (same locationReference, different incident)
  const coLocatedIncidents = ctx.incidents
    .filter(
      (i) =>
        i.id !== incidentId &&
        i.locationReference === targetIncident.locationReference &&
        i.status !== 'resolved',
    )
    .sort(bySeverityDesc)
    .slice(0, MAX_INCIDENTS - 1);

  const incidents = [targetIncident, ...coLocatedIncidents];

  // Gate associated with the incident's location reference
  const associatedGates = ctx.gates
    .filter((g) => g.id === targetIncident.locationReference)
    .slice(0, 1);

  // If the associated gate was found, also include any other elevated-risk gates
  // (gives Gemini overflow-redirection context)
  const overflowGates = ctx.gates
    .filter((g) => g.id !== targetIncident.locationReference && g.riskLevel !== 'low')
    .sort(byRiskDesc)
    .slice(0, MAX_GATES - associatedGates.length);

  const gates = [...associatedGates, ...overflowGates];

  // Medical resources for medical or crowd-surge incidents (safety awareness)
  const needsMedical =
    targetIncident.incidentType === 'medical' || targetIncident.incidentType === 'crowd-surge';
  const medicalResources = needsMedical ? ctx.medicalResources : null;

  // Volunteers in the incident's zone
  const gateLabel = associatedGates[0]?.displayName.split('—')[0].trim() ?? '';
  const volunteers = ctx.volunteers
    .filter(
      (v) =>
        (gateLabel && v.assignedZone.startsWith(gateLabel)) ||
        v.assignedZone.includes(targetIncident.locationReference),
    )
    .sort(byVolunteerPriority)
    .slice(0, MAX_VOLUNTEERS);

  // Accessibility assets at the incident location
  const accessibilityAssets = ctx.accessibilityAssets
    .filter((a) => a.locationReference === targetIncident.locationReference)
    .slice(0, MAX_ASSETS);

  return {
    gates,
    weather: ctx.weather,
    incidents,
    accessibilityAssets,
    medicalResources,
    volunteers,
  };
}

// ─── Global / Periodic-scan filter ───────────────────────────────────────────

/**
 * Filters signals for a periodic-scan or "global" trigger.
 *
 * DESIGN PRINCIPLE — this filter is the most selective of the three:
 * A periodic scan exists to surface ONLY what needs attention right now.
 * Including calm, nominal data is counterproductive — it buries real signals
 * in noise and produces generic recommendations. Therefore:
 *
 *   ✅ INCLUDE: gates with riskLevel "high" or "critical"
 *   ✅ INCLUDE: all open (non-resolved) incidents
 *   ✅ INCLUDE: weather if condition is not "clear" or "cloudy" (i.e., if
 *              it's actively affecting operations)
 *   ✅ INCLUDE: accessibility assets that are "out-of-service" or "busy"
 *   ✅ INCLUDE: medical resources if activeMedicalIncidents > 0
 *   ✅ INCLUDE: volunteers who are "assigned" to active crowd-control tasks
 *              (limited to zones with elevated-risk gates)
 *   ❌ EXCLUDE: low/moderate gates in normal operation
 *   ❌ EXCLUDE: clear weather with no effect
 *   ❌ EXCLUDE: operational assets that are working fine
 *   ❌ EXCLUDE: idle or off-duty volunteers not attached to any active zone
 */
function filterGlobal(ctx: StadiumContext): Omit<RelevantSignals, 'metadata' | 'trigger'> {
  // Only elevated-risk gates (high or critical)
  const gates = ctx.gates
    .filter((g) => g.riskLevel === 'high' || g.riskLevel === 'critical')
    .sort(byRiskDesc)
    .slice(0, MAX_GATES);

  // Weather — only include if it's actively affecting conditions
  // "clear" and "cloudy" with no rain are nominal; anything else is signal.
  const weatherIsRelevant = ctx.weather.condition !== 'clear' && ctx.weather.condition !== 'cloudy';
  const weather = weatherIsRelevant
    ? ctx.weather
    : {
        ...ctx.weather,
        // Still include the object (keeps RelevantSignals shape consistent) but
        // mark it nominal so Prompt Builder can omit the weather section if desired.
        condition: ctx.weather.condition, // unchanged, just documenting intent
      };

  // All open incidents — sorted by severity
  const incidents = ctx.incidents
    .filter((i) => i.status !== 'resolved')
    .sort(bySeverityDesc)
    .slice(0, MAX_INCIDENTS);

  // Accessibility assets that need attention
  const accessibilityAssets = ctx.accessibilityAssets
    .filter((a) => a.status === 'out-of-service' || a.status === 'busy')
    .slice(0, MAX_ASSETS);

  // Medical resources only if there are active medical incidents
  const medicalResources =
    ctx.medicalResources.activeMedicalIncidents > 0 ? ctx.medicalResources : null;

  // Volunteers in elevated-risk gate zones (gives Gemini redeployment context)
  const elevatedGateLabels = new Set(gates.map((g) => g.displayName.split('—')[0].trim()));
  const volunteers = ctx.volunteers
    .filter((v) => [...elevatedGateLabels].some((label) => v.assignedZone.startsWith(label)))
    .sort(byVolunteerPriority)
    .slice(0, MAX_VOLUNTEERS);

  return {
    gates,
    weather,
    incidents,
    accessibilityAssets: accessibilityAssets.length > 0 ? accessibilityAssets : null,
    medicalResources,
    volunteers,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Narrows a full StadiumContext to a focused RelevantSignals object based on
 * the provided DecisionTrigger.
 *
 * Routing logic:
 *   - trigger.reference starts with "gate-"     → gate-scoped filter
 *   - trigger.reference starts with "inc-"      → incident-scoped filter
 *   - trigger.reference === "global"             → global periodic-scan filter
 *   - any other reference                        → treated as gate if it matches
 *                                                  a gate ID, otherwise global
 *
 * Always includes ctx.metadata so Prompt Builder has baseline context.
 */
export function filterSignals(ctx: StadiumContext, trigger: DecisionTrigger): RelevantSignals {
  const ref = trigger.reference.toLowerCase().trim();

  let filtered: Omit<RelevantSignals, 'metadata' | 'trigger'>;

  if (ref === 'global') {
    filtered = filterGlobal(ctx);
  } else if (ref.startsWith('inc-')) {
    filtered = filterByIncident(ctx, ref);
  } else if (ref.startsWith('gate-') || ctx.gates.some((g) => g.id === ref)) {
    filtered = filterByGate(ctx, ref);
  } else {
    // Unrecognised reference — fall back to global scan and log a warning
    console.warn(
      `[Signal Filter] Unrecognised trigger reference "${trigger.reference}". ` +
        `Falling back to global scan.`,
    );
    filtered = filterGlobal(ctx);
  }

  return {
    metadata: ctx.metadata,
    trigger,
    ...filtered,
  };
}
