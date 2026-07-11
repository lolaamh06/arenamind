/**
 * Context Engine — Validator
 *
 * Enforces internal consistency rules on a StadiumContext before it is
 * persisted to the store. All mutations (scenarios and future pipeline
 * stages) MUST run the context through validate() before calling
 * store.setState().
 *
 * Rules enforced:
 *
 * 1. Attendance ≤ totalCapacity (hard clamp).
 * 2. Gate occupancyPercent clamped to [0, 100].
 * 3. Gate riskLevel derived from occupancyPercent + trend:
 *      occupancy < 60                                   → "low"
 *      occupancy 60–79                                  → "moderate"
 *      occupancy 80–94                                  → "high"
 *      occupancy ≥ 95 OR (≥ 85 AND trend==="increasing") → "critical"
 * 4. medicalResources.activeMedicalIncidents is recomputed from the
 *    incidents array (type="medical", status !== "resolved").
 * 5. availableMedics clamped to [0, totalMedics].
 * 6. availableAmbulances clamped to [0, totalAmbulances].
 * 7. Weather.rainIntensity is 0 when condition is "clear" or "cloudy".
 *
 * The validate() function is pure — it returns a corrected copy and never
 * mutates its input.
 */

import type { StadiumContext, Gate, RiskLevel } from '../../types';

// ─── Rule helpers ────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function deriveRiskLevel(gate: Gate): RiskLevel {
  const occ = gate.occupancyPercent;
  if (occ >= 95 || (occ >= 85 && gate.trend === 'increasing')) return 'critical';
  if (occ >= 80) return 'high';
  if (occ >= 60) return 'moderate';
  return 'low';
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Validates and corrects a StadiumContext.
 * Returns a new, corrected object. Input is never mutated.
 *
 * Logs a warning for each correction made so operators can trace unexpected
 * state discrepancies.
 */
export function validate(ctx: StadiumContext): StadiumContext {
  // Deep-clone so we never mutate the caller's object.
  const c: StadiumContext = JSON.parse(JSON.stringify(ctx)) as StadiumContext;

  // Rule 1: Attendance ≤ totalCapacity
  if (c.metadata.currentAttendance > c.metadata.totalCapacity) {
    console.warn(
      `[Validator] currentAttendance (${c.metadata.currentAttendance}) exceeded totalCapacity (${c.metadata.totalCapacity}). Clamping.`,
    );
    c.metadata.currentAttendance = c.metadata.totalCapacity;
  }

  // Rules 2 & 3: Gate occupancy and riskLevel
  c.gates = c.gates.map((gate) => {
    const clamped = clamp(gate.occupancyPercent, 0, 100);
    if (clamped !== gate.occupancyPercent) {
      console.warn(
        `[Validator] Gate ${gate.id} occupancyPercent ${gate.occupancyPercent} out of [0,100]. Clamping to ${clamped}.`,
      );
    }
    const correctedGate = { ...gate, occupancyPercent: clamped };
    const derivedRisk = deriveRiskLevel(correctedGate);
    if (derivedRisk !== gate.riskLevel) {
      console.warn(
        `[Validator] Gate ${gate.id} riskLevel was "${gate.riskLevel}", corrected to "${derivedRisk}" based on occupancy ${clamped}% + trend "${gate.trend}".`,
      );
    }
    return { ...correctedGate, riskLevel: derivedRisk };
  });

  // Rule 4: Recompute activeMedicalIncidents from incidents array.
  const activeMedical = c.incidents.filter(
    (inc) => inc.incidentType === 'medical' && inc.status !== 'resolved',
  ).length;
  if (activeMedical !== c.medicalResources.activeMedicalIncidents) {
    console.warn(
      `[Validator] activeMedicalIncidents was ${c.medicalResources.activeMedicalIncidents}, recomputed to ${activeMedical}.`,
    );
    c.medicalResources.activeMedicalIncidents = activeMedical;
  }

  // Rule 5: availableMedics ∈ [0, totalMedics]
  const clampedMedics = clamp(
    c.medicalResources.availableMedics,
    0,
    c.medicalResources.totalMedics,
  );
  if (clampedMedics !== c.medicalResources.availableMedics) {
    console.warn(
      `[Validator] availableMedics ${c.medicalResources.availableMedics} out of [0,${c.medicalResources.totalMedics}]. Clamping to ${clampedMedics}.`,
    );
    c.medicalResources.availableMedics = clampedMedics;
  }

  // Rule 6: availableAmbulances ∈ [0, totalAmbulances]
  const clampedAmbs = clamp(
    c.medicalResources.availableAmbulances,
    0,
    c.medicalResources.totalAmbulances,
  );
  if (clampedAmbs !== c.medicalResources.availableAmbulances) {
    console.warn(
      `[Validator] availableAmbulances ${c.medicalResources.availableAmbulances} out of [0,${c.medicalResources.totalAmbulances}]. Clamping to ${clampedAmbs}.`,
    );
    c.medicalResources.availableAmbulances = clampedAmbs;
  }

  // Rule 7: No rain intensity for clear or cloudy conditions.
  if (c.weather.condition === 'clear' || c.weather.condition === 'cloudy') {
    if (c.weather.rainIntensity !== 0) {
      console.warn(
        `[Validator] rainIntensity ${c.weather.rainIntensity} is non-zero for condition "${c.weather.condition}". Resetting to 0.`,
      );
      c.weather.rainIntensity = 0;
    }
  }

  return c;
}
