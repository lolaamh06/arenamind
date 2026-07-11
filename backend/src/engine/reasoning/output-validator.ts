/**
 * ArenaMind AI Reasoning Pipeline — Output Validator
 *
 * RESPONSIBILITY:
 * Takes the raw Gemini response string and the RelevantSignals it was generated
 * from, and returns a ValidationResult. Never throws — all failure modes are
 * represented as a returned ValidationResult with isValid: false.
 *
 * VALIDATION STEPS (in order):
 *   1. JSON parse attempt
 *   2. Markdown-fence repair pass (one attempt only)
 *   3. Required field presence and type checks
 *   4. Content quality checks (non-empty strings/arrays)
 *   5. Urgency enum validation
 *   6. Evidence grounding heuristic (warns, does not reject)
 *
 * EVIDENCE GROUNDING HEURISTIC:
 * For each evidence string, we check whether any "known entity" extracted from
 * RelevantSignals appears as a case-insensitive substring of the evidence string.
 * Known entities include: gate IDs and display names, volunteer names, incident
 * IDs and types, occupancy percentages, weather conditions, and numeric values
 * from gate queues/occupancy.
 *
 * IMPORTANT LIMITATIONS (documented honestly):
 * - This is substring matching, not semantic NLP. Gemini often paraphrases
 *   ("Gate D" vs "the south-east corner gate") in ways that won't match even
 *   when correctly grounded. Unmatched evidence strings therefore produce
 *   WARNINGS, not hard rejections.
 * - Numeric matching is approximate — we extract numbers from the signals and
 *   check if they appear in the evidence string, but ±5% paraphrasing of a
 *   percentage will not match. This is acceptable for a hackathon MVP.
 * - This heuristic exists to catch egregious hallucination (entirely invented
 *   numbers or locations), not to perfectly verify every sentence.
 */

import type {
  GeminiResponseSchema,
  RelevantSignals,
  ValidationResult,
} from '../../types/reasoning';

// ─── Urgency enum ─────────────────────────────────────────────────────────────

const VALID_URGENCY_VALUES: GeminiResponseSchema['urgency'][] = [
  'low',
  'moderate',
  'high',
  'critical',
];

// ─── Markdown fence repair ────────────────────────────────────────────────────

/**
 * Strips markdown code fences from a string.
 * Handles ```json ... ```, ``` ... ```, and variations with leading/trailing
 * whitespace. Returns the stripped string (may be unchanged if no fences found).
 */
function stripMarkdownFences(raw: string): string {
  // Match optional "json" language tag after the opening fence
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

// ─── Evidence grounding heuristic ─────────────────────────────────────────────

/**
 * Extracts a flat list of "known entity" strings from the RelevantSignals
 * object. These are the tokens we check evidence strings against.
 *
 * Entities extracted:
 *   - Gate IDs (e.g., "gate-d") and display name fragments (e.g., "Gate D")
 *   - Volunteer display names (e.g., "Tobias Eriksen")
 *   - Incident IDs and incidentType strings (e.g., "crowd-surge", "medical")
 *   - Numeric strings from occupancy %, queue estimates
 *   - Weather condition strings
 *   - Accessibility asset display location fragments
 */
function extractKnownEntities(signals: RelevantSignals): string[] {
  const entities: string[] = [];

  // Stadium name / metadata
  entities.push(signals.metadata.name.toLowerCase());
  entities.push(signals.metadata.matchPhase.toLowerCase());

  // Gates
  for (const gate of signals.gates) {
    entities.push(gate.id.toLowerCase()); // "gate-d"
    // Extract the short label "Gate D" from displayName "Gate D — South-East Corner"
    const shortLabel = gate.displayName.split('—')[0].trim().toLowerCase();
    entities.push(shortLabel);
    entities.push(String(gate.occupancyPercent)); // "81"
    entities.push(String(gate.queueEstimate)); // "780"
    entities.push(gate.riskLevel); // "high"
    entities.push(gate.trend); // "increasing"
    for (const section of gate.servedSections) {
      entities.push(section.toLowerCase());
    }
  }

  // Weather
  entities.push(signals.weather.condition.toLowerCase());
  entities.push(String(signals.weather.temperatureCelsius));

  // Incidents
  for (const inc of signals.incidents) {
    entities.push(inc.id.toLowerCase());
    entities.push(inc.incidentType.toLowerCase());
    entities.push(inc.severity.toLowerCase());
    entities.push(inc.status.toLowerCase());
    // Location fragments
    const locWords = inc.displayLocation.toLowerCase().split(/[\s—,]+/);
    entities.push(...locWords.filter((w) => w.length > 3));
  }

  // Volunteers
  for (const vol of signals.volunteers) {
    // Split name into parts so "Tobias" or "Eriksen" both match
    const nameParts = vol.displayName.toLowerCase().split(/\s+/);
    entities.push(...nameParts);
    entities.push(vol.assignedZone.toLowerCase());
    entities.push(vol.status.toLowerCase());
  }

  // Accessibility assets
  if (signals.accessibilityAssets) {
    for (const asset of signals.accessibilityAssets) {
      entities.push(asset.assetType.toLowerCase());
      entities.push(asset.status.toLowerCase());
      const locWords = asset.displayLocation.toLowerCase().split(/[\s—,]+/);
      entities.push(...locWords.filter((w) => w.length > 3));
    }
  }

  // Medical
  if (signals.medicalResources) {
    entities.push(String(signals.medicalResources.availableMedics));
    entities.push(String(signals.medicalResources.totalMedics));
    entities.push(String(signals.medicalResources.availableAmbulances));
  }

  // De-duplicate and filter out trivially short/meaningless tokens
  return [...new Set(entities)].filter((e) => e.length >= 2);
}

/**
 * Returns true if the evidence string plausibly references at least one known
 * entity from the signals. Case-insensitive substring matching.
 *
 * See file-level comment for documented limitations of this heuristic.
 */
function isEvidenceGrounded(evidenceString: string, knownEntities: string[]): boolean {
  const lower = evidenceString.toLowerCase();
  return knownEntities.some((entity) => lower.includes(entity));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validates a raw Gemini response string against the GeminiResponseSchema.
 *
 * Returns a ValidationResult. Never throws — all failure modes are handled.
 */
export function validateGeminiOutput(
  raw: GeminiRawResponse,
  signals: RelevantSignals,
): ValidationResult {
  const validationErrors: string[] = [];
  const evidenceWarnings: string[] = [];
  let wasRepaired = false;
  let parsed: unknown;

  // ── Step 1: Initial JSON parse ─────────────────────────────────────────────
  try {
    parsed = JSON.parse(raw);
  } catch {
    // ── Step 2: Repair pass — strip markdown fences and retry ─────────────
    const repaired = stripMarkdownFences(raw);
    try {
      parsed = JSON.parse(repaired);
      wasRepaired = true;
    } catch (repairErr) {
      return {
        isValid: false,
        parsed: undefined,
        validationErrors: [
          `Failed to parse Gemini response as JSON (even after markdown-fence repair). ` +
            `Parse error: ${repairErr instanceof Error ? repairErr.message : String(repairErr)}. ` +
            `Raw response (first 200 chars): ${raw.slice(0, 200)}`,
        ],
        evidenceWarnings: [],
        wasRepaired: false,
      };
    }
  }

  // ── Step 3: Type guard — must be a plain object ────────────────────────────
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      isValid: false,
      parsed: undefined,
      validationErrors: ['Gemini response parsed to a non-object value (expected a JSON object).'],
      evidenceWarnings: [],
      wasRepaired,
    };
  }

  const obj = parsed as Record<string, unknown>;

  // ── Step 4: Required field presence and type checks ─────────────────────────
  if (typeof obj['recommendation'] !== 'string') {
    validationErrors.push('Missing or non-string field: "recommendation".');
  }
  if (typeof obj['reasoning'] !== 'string') {
    validationErrors.push('Missing or non-string field: "reasoning".');
  }
  if (!Array.isArray(obj['evidence'])) {
    validationErrors.push('Missing or non-array field: "evidence".');
  } else if (!obj['evidence'].every((e) => typeof e === 'string')) {
    validationErrors.push('"evidence" array must contain only strings.');
  }
  if (typeof obj['urgency'] !== 'string') {
    validationErrors.push('Missing or non-string field: "urgency".');
  }
  if (!Array.isArray(obj['suggestedActions'])) {
    validationErrors.push('Missing or non-array field: "suggestedActions".');
  } else if (!obj['suggestedActions'].every((a) => typeof a === 'string')) {
    validationErrors.push('"suggestedActions" array must contain only strings.');
  }

  if (validationErrors.length > 0) {
    return { isValid: false, parsed: undefined, validationErrors, evidenceWarnings, wasRepaired };
  }

  // ── Step 5: Content quality checks ─────────────────────────────────────────
  if ((obj['recommendation'] as string).trim() === '') {
    validationErrors.push('"recommendation" must not be an empty string.');
  }
  if ((obj['reasoning'] as string).trim() === '') {
    validationErrors.push('"reasoning" must not be an empty string.');
  }
  if ((obj['evidence'] as string[]).length === 0) {
    validationErrors.push(
      '"evidence" must not be an empty array — a brief with no evidence is not usable.',
    );
  }
  if ((obj['suggestedActions'] as string[]).length === 0) {
    validationErrors.push(
      '"suggestedActions" must not be an empty array — a brief with no actions is not usable.',
    );
  }

  // ── Step 5b: Urgency enum validation ───────────────────────────────────────
  if (!VALID_URGENCY_VALUES.includes(obj['urgency'] as GeminiResponseSchema['urgency'])) {
    validationErrors.push(
      `"urgency" must be one of: ${VALID_URGENCY_VALUES.join(', ')}. ` +
        `Received: "${obj['urgency']}".`,
    );
  }

  if (validationErrors.length > 0) {
    return { isValid: false, parsed: undefined, validationErrors, evidenceWarnings, wasRepaired };
  }

  // ── Step 6: Evidence grounding heuristic ───────────────────────────────────
  const knownEntities = extractKnownEntities(signals);
  const evidenceArray = obj['evidence'] as string[];

  for (const evidenceItem of evidenceArray) {
    if (!isEvidenceGrounded(evidenceItem, knownEntities)) {
      evidenceWarnings.push(
        `Evidence item could not be matched to any known signal entity ` +
          `(possible hallucination or heavy paraphrase): "${evidenceItem.slice(0, 120)}"`,
      );
    }
  }

  // Valid — assemble the typed object
  const result: GeminiResponseSchema = {
    recommendation: obj['recommendation'] as string,
    reasoning: obj['reasoning'] as string,
    evidence: obj['evidence'] as string[],
    urgency: obj['urgency'] as GeminiResponseSchema['urgency'],
    suggestedActions: obj['suggestedActions'] as string[],
  };

  return {
    isValid: true,
    parsed: result,
    validationErrors: [],
    evidenceWarnings,
    wasRepaired,
  };
}

// Re-export the type so import paths are clean
import type { GeminiRawResponse } from '../../types/reasoning';
