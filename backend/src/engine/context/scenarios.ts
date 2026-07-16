/**
 * Context Engine — Scenarios
 *
 * Implements the three named scenario mutations:
 *   applyHeavyRain      — Heavy weather stress test
 *   applyCrowdSurge     — Gate D / East Side crowd crush escalation
 *   applyMedicalIncident — Multi-patient medical emergency at Gate C
 *
 * Design constraints (from spec):
 *   1. Each function is idempotent — applying the same scenario twice produces
 *      the same result as applying it once.
 *   2. Mutations are multi-field and realistic — they cascade across weather,
 *      gates, transport, medical resources, incidents, and volunteers as a
 *      real event would.
 *   3. Every mutation function MUST call validate() before returning the new
 *      context, so all consistency rules (riskLevel derivation, incident
 *      counting, clamping) are always enforced.
 *   4. Mutations produce a new object — they never mutate their input.
 */

import type { StadiumContext, Gate, Incident, Volunteer } from '../../types';
import { validate, MAX_MATCH_MINUTE } from './validator';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns a deep-clone of ctx so we never mutate the in-store copy. */
function deepClone(ctx: StadiumContext): StadiumContext {
  return JSON.parse(JSON.stringify(ctx)) as StadiumContext;
}

/** Mutates a single gate by id within an already-cloned gate array. */
function mutateGate(gates: Gate[], id: string, patch: Partial<Gate>): Gate[] {
  return gates.map((g) => (g.id === id ? { ...g, ...patch } : g));
}

// ─── Scenario 1: Heavy Rain ──────────────────────────────────────────────────

/**
 * Heavy Rain scenario.
 *
 * Realistic cascades:
 * - Weather deteriorates to heavy-rain; rainIntensity 7, windSpeedKph 38,
 *   temperatureCelsius drops to 16, comfortIndicator → "unpleasant".
 * - All gates: queues swell as fans shelter under canopies. East-side gates
 *   (C, D) worsen most because that side lacks covered walkways.
 * - Transport: North Metro becomes delayed; East Rideshare wait triples.
 * - Transport advisory updated.
 * - Weather-related incident logged (standing water at Gate D corridor).
 * - 2 volunteers reassigned to shelter management.
 */
export function applyHeavyRain(ctx: StadiumContext): StadiumContext {
  const c = deepClone(ctx);

  // Weather
  c.weather.condition = 'heavy-rain';
  c.weather.rainIntensity = 7;
  c.weather.windSpeedKph = 38;
  c.weather.temperatureCelsius = 16;
  c.weather.comfortIndicator = 'unpleasant';

  // Gates — queues and occupancy worsen. East side (C, D) worst affected.
  c.gates = mutateGate(c.gates, 'gate-a', {
    queueEstimate: 320,
    occupancyPercent: 58,
    trend: 'increasing',
  });
  c.gates = mutateGate(c.gates, 'gate-b', {
    queueEstimate: 490,
    occupancyPercent: 68,
    trend: 'increasing',
  });
  c.gates = mutateGate(c.gates, 'gate-c', {
    queueEstimate: 920,
    occupancyPercent: 86,
    trend: 'increasing',
  });
  c.gates = mutateGate(c.gates, 'gate-d', {
    queueEstimate: 1350,
    occupancyPercent: 92,
    trend: 'increasing',
  });
  c.gates = mutateGate(c.gates, 'gate-e', {
    queueEstimate: 410,
    occupancyPercent: 65,
    trend: 'increasing',
  });
  c.gates = mutateGate(c.gates, 'gate-f', {
    queueEstimate: 280,
    occupancyPercent: 55,
    trend: 'increasing',
  });
  c.gates = mutateGate(c.gates, 'gate-g', {
    queueEstimate: 560,
    occupancyPercent: 72,
    trend: 'increasing',
  });
  c.gates = mutateGate(c.gates, 'gate-h', {
    queueEstimate: 210,
    occupancyPercent: 48,
    trend: 'stable',
  });

  // Transport
  c.transport.hubs = c.transport.hubs.map((hub) => {
    if (hub.id === 'hub-north-metro') {
      return { ...hub, status: 'delayed', estimatedWaitMinutes: 22, occupancyPercent: 91 };
    }
    if (hub.id === 'hub-east-taxi') {
      return { ...hub, status: 'busy', estimatedWaitMinutes: 35 };
    }
    if (hub.id === 'hub-south-bus') {
      return { ...hub, status: 'busy', estimatedWaitMinutes: 15, occupancyPercent: 72 };
    }
    return hub;
  });
  c.transport.generalAdvisory =
    'HEAVY RAIN IN EFFECT. North Metro Station severely delayed. Fans advised to use South Bus Terminal or shelter in stadium concourses until rain eases. East Rideshare wait time approximately 35 minutes.';

  // Incident — idempotent: only add if not already present
  const alreadyHasRainIncident = c.incidents.some((i) => i.id === 'inc-hr-001');
  if (!alreadyHasRainIncident) {
    const rainIncident: Incident = {
      id: 'inc-hr-001',
      incidentType: 'weather-related',
      severity: 'moderate',
      locationReference: 'gate-d',
      displayLocation: 'Gate D — South-East Corner Corridor',
      reportedAt: new Date().toISOString(),
      status: 'open',
      description:
        'Standing water accumulating in Gate D corridor due to heavy rain. Slip hazard reported. Maintenance and two volunteers deployed for crowd management and hazard barriers.',
    };
    c.incidents.push(rainIncident);
  }

  // Volunteers — reassign two available volunteers to shelter management
  c.volunteers = c.volunteers.map((v) => {
    if (v.id === 'vol-005' && v.status === 'available') {
      return {
        ...v,
        status: 'assigned',
        assignedZone: 'Gate E Shelter',
        currentTask: 'Managing fan shelter queue under Gate E canopy during heavy rain',
      };
    }
    if (v.id === 'vol-007' && v.status === 'available') {
      return {
        ...v,
        status: 'assigned',
        assignedZone: 'Gate G Shelter',
        currentTask: 'Directing fans to covered areas at Gate G during heavy rain',
      };
    }
    return v;
  });

  // Phase 4C-1: Nudge matchMinute forward by 4 minutes to simulate match
  // progression during a demo session. Clamped to MAX_MATCH_MINUTE (99).
  c.matchInfo.matchMinute = Math.min(MAX_MATCH_MINUTE, c.matchInfo.matchMinute + 4);

  return validate(c);
}

// ─── Scenario 2: Crowd Surge ─────────────────────────────────────────────────

/**
 * Crowd Surge scenario.
 *
 * Realistic cascades:
 * - Gate D reaches critical occupancy (97%) with rapidly increasing trend.
 * - Gate C also escalates to high.
 * - A crowd-surge incident is opened at Gate D.
 * - 3 available volunteers immediately reassigned to Gate D crowd management.
 * - Medical: 2 medics dispatched pre-emptively (availableMedics − 2).
 * - Transport: East rideshare + South bus told to halt new drop-offs.
 */
export function applyCrowdSurge(ctx: StadiumContext): StadiumContext {
  const c = deepClone(ctx);

  // Gates — Gate D is critical; C escalates
  c.gates = mutateGate(c.gates, 'gate-d', {
    occupancyPercent: 97,
    trend: 'increasing',
    queueEstimate: 1600,
  });
  c.gates = mutateGate(c.gates, 'gate-c', {
    occupancyPercent: 84,
    trend: 'increasing',
    queueEstimate: 870,
  });
  c.gates = mutateGate(c.gates, 'gate-b', {
    occupancyPercent: 63,
    trend: 'increasing',
    queueEstimate: 420,
  });

  // Incident — idempotent: use the incident's presence as the single source of
  // truth for whether this scenario has already been applied. Medical deduction
  // and volunteer reassignment are both gated on the same flag so that a second
  // call (without a reset) is a true no-op for all side-effects.
  const alreadyHasSurgeIncident = c.incidents.some((i) => i.id === 'inc-cs-001');
  if (!alreadyHasSurgeIncident) {
    const surgeIncident: Incident = {
      id: 'inc-cs-001',
      incidentType: 'crowd-surge',
      severity: 'critical',
      locationReference: 'gate-d',
      displayLocation: 'Gate D — South-East Corner',
      reportedAt: new Date().toISOString(),
      status: 'open',
      description:
        'Crowd surge detected at Gate D. Occupancy has reached critical level (97%). Barrier teams deployed. Fans being redirected to Gates E and F. Two medics dispatched as a precautionary measure.',
    };
    c.incidents.push(surgeIncident);

    // Medical — pre-emptively dispatch 2 medics (only on first application)
    c.medicalResources.availableMedics = Math.max(0, c.medicalResources.availableMedics - 2);

    // Volunteers — reassign up to 3 available volunteers to Gate D crowd control.
    // Only runs on first application; subsequent calls leave volunteers untouched.
    let reassigned = 0;
    c.volunteers = c.volunteers.map((v) => {
      if (reassigned >= 3) return v;
      if (v.status === 'available') {
        reassigned++;
        return {
          ...v,
          status: 'assigned' as Volunteer['status'],
          assignedZone: 'Gate D — Crowd Control',
          currentTask: 'Emergency crowd management at Gate D — redirecting fans to Gates E and F',
        };
      }
      return v;
    });
  }

  // Transport — halt new drop-offs to East side
  c.transport.hubs = c.transport.hubs.map((hub) => {
    if (hub.id === 'hub-east-taxi') {
      return { ...hub, status: 'suspended', estimatedWaitMinutes: 0 };
    }
    return hub;
  });
  c.transport.generalAdvisory =
    'CROWD SURGE ALERT at Gate D. East Rideshare drop-off suspended. All fans arriving by rideshare or taxi are redirected to North Metro Station. Fans in sections 118–121 should use Gates E or F for egress.';

  // Phase 4C-1: Nudge matchMinute forward by 3 minutes to simulate match
  // progression during a demo session. Clamped to MAX_MATCH_MINUTE (99).
  c.matchInfo.matchMinute = Math.min(MAX_MATCH_MINUTE, c.matchInfo.matchMinute + 3);

  return validate(c);
}

// ─── Scenario 3: Medical Incident ────────────────────────────────────────────

/**
 * Medical Incident scenario.
 *
 * Realistic cascades:
 * - A multi-patient medical incident opens at Gate C (e.g., heat collapse).
 * - Two medical incidents recorded (two patients: one moderate, one critical).
 * - 4 medics dispatched (availableMedics − 4); 1 ambulance deployed (−1).
 * - Area around Gate C cleared — Gate C volunteer deployed to manage fan
 *   diversion. Gate C queue fans directed to Gate B.
 * - Gate B occupancy + queue increases slightly from diversion.
 */
export function applyMedicalIncident(ctx: StadiumContext): StadiumContext {
  const c = deepClone(ctx);

  // Incidents — two patients; idempotent
  const alreadyHasMed1 = c.incidents.some((i) => i.id === 'inc-med-001');
  if (!alreadyHasMed1) {
    const incident1: Incident = {
      id: 'inc-med-001',
      incidentType: 'medical',
      severity: 'high',
      locationReference: 'gate-c',
      displayLocation: 'Gate C — East Stand Concourse',
      reportedAt: new Date().toISOString(),
      status: 'open',
      description:
        'Fan collapsed at Gate C concourse — suspected heat exhaustion. Medical team en route. Area being cleared.',
    };
    c.incidents.push(incident1);
  }

  const alreadyHasMed2 = c.incidents.some((i) => i.id === 'inc-med-002');
  if (!alreadyHasMed2) {
    const incident2: Incident = {
      id: 'inc-med-002',
      incidentType: 'medical',
      severity: 'critical',
      locationReference: 'gate-c',
      displayLocation: 'Gate C — East Stand Concourse (secondary patient)',
      reportedAt: new Date().toISOString(),
      status: 'open',
      description:
        'Second fan requiring emergency attention near Gate C — possible cardiac event. Ambulance requested. Defibrillator retrieved from North Medical Centre.',
    };
    c.incidents.push(incident2);
  }

  // Medical resources — dispatch 4 medics, 1 ambulance
  c.medicalResources.availableMedics = Math.max(0, c.medicalResources.availableMedics - 4);
  c.medicalResources.availableAmbulances = Math.max(0, c.medicalResources.availableAmbulances - 1);

  // Volunteers — assign Gate C volunteers to diversion management.
  // Only volunteers with status === 'available' are eligible for automatic
  // reassignment by a scenario. Volunteers who are 'on-break' or 'off-duty'
  // must never be pulled into active duty by automated scenario logic —
  // that decision requires explicit human (operations manager) action.
  c.volunteers = c.volunteers.map((v) => {
    if (v.id === 'vol-003' && v.status === 'available') {
      return {
        ...v,
        status: 'assigned' as Volunteer['status'],
        assignedZone: 'Gate C — Medical Diversion',
        currentTask:
          'Diverting Gate C fans to Gate B; maintaining clear access corridor for ambulance',
      };
    }
    if (v.id === 'vol-012' && v.status === 'available') {
      return {
        ...v,
        status: 'assigned' as Volunteer['status'],
        assignedZone: 'Gate C — Medical Diversion',
        currentTask: 'Assisting paramedics with crowd clearance at Gate C medical scene',
      };
    }
    return v;
  });

  // Gate C — slightly reduced as fans are diverted away
  c.gates = mutateGate(c.gates, 'gate-c', {
    trend: 'decreasing',
    queueEstimate: Math.max(0, c.gates.find((g) => g.id === 'gate-c')!.queueEstimate - 150),
  });

  // Gate B — absorbs diverted fans
  const gateB = c.gates.find((g) => g.id === 'gate-b')!;
  c.gates = mutateGate(c.gates, 'gate-b', {
    occupancyPercent: Math.min(100, gateB.occupancyPercent + 8),
    queueEstimate: gateB.queueEstimate + 220,
    trend: 'increasing',
  });

  c.transport.generalAdvisory =
    'MEDICAL INCIDENT at Gate C. Gate C is temporarily restricted. Fans with tickets for sections 112–117 should use Gate B. Emergency services have priority access to Gate C corridor.';

  // Phase 4C-1: Nudge matchMinute forward by 5 minutes to simulate match
  // progression during a demo session. Clamped to MAX_MATCH_MINUTE (99).
  c.matchInfo.matchMinute = Math.min(MAX_MATCH_MINUTE, c.matchInfo.matchMinute + 5);

  return validate(c);
}
