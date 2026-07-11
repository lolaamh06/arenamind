/**
 * ArenaMind AI Reasoning Pipeline — Confidence Engine
 *
 * RESPONSIBILITY:
 * Computes a deterministic, transparent confidence score (0–100) for a validated
 * Gemini recommendation, along with a confidence tier and a per-factor breakdown.
 *
 * The breakdown is a first-class output — it is displayed verbatim in the Judge
 * Experience's "Confidence Panel" and must be human-readable and self-explanatory.
 * Do not make this a black box.
 *
 * SCORING SYSTEM (additive/subtractive from base 100):
 * ─────────────────────────────────────────────────────────────────────────────
 * STARTING BASE:                                          +100
 *
 * PENALTIES (subtractive):
 *   evidence_warning:    -15 per unmatched evidence item   (min floor: 10)
 *   retry_needed:        -10  Gemini needed a retry → mild transient instability
 *   sparse_signals:      -15  Fewer than 2 gates AND fewer than 2 incidents
 *                             in signals → less grounding data available
 *   urgency_mismatch:    -20  Urgency is "critical" but signals contain no
 *                             "critical" or "high" risk gate/incident → suspicious
 *   repair_needed:       -5   Response required markdown-fence repair before
 *                             parsing → model didn't follow output format exactly
 *
 * BONUSES (additive):
 *   strong_evidence:     +10  3+ evidence items all matched to known signals
 *                             → multiple corroborating data points
 *
 * CLAMP: final score is clamped to [0, 100]
 *
 * TIERS:
 *   80–100 → "high"
 *   50–79  → "moderate"
 *   0–49   → "low"
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
  ValidationResult,
  RelevantSignals,
  ConfidenceScore,
  ConfidenceBreakdownFactor,
  ConfidenceTier,
} from '../../types/reasoning';

// ─── Weight constants ─────────────────────────────────────────────────────────

const BASE_SCORE = 100;
const PENALTY_PER_EVIDENCE_WARNING = -15;
const EVIDENCE_WARNING_FLOOR = 10; // never penalise below this total score purely from evidence warnings
const PENALTY_RETRY_NEEDED = -10;
const PENALTY_SPARSE_SIGNALS = -15;
const PENALTY_URGENCY_MISMATCH = -20;
const PENALTY_REPAIR_NEEDED = -5;
const BONUS_STRONG_EVIDENCE = +10;

// ─── Tier thresholds ─────────────────────────────────────────────────────────

function scoreToTier(score: number): ConfidenceTier {
  if (score >= 80) return 'high';
  if (score >= 50) return 'moderate';
  return 'low';
}

// ─── Signal severity helpers ──────────────────────────────────────────────────

/**
 * Returns true if the signals contain at least one gate with riskLevel "high"
 * or "critical", or at least one incident with severity "high" or "critical".
 * Used for the urgency_mismatch check.
 */
function signalsHaveElevatedSeverity(signals: RelevantSignals): boolean {
  const hasHighGate = signals.gates.some(
    (g) => g.riskLevel === 'high' || g.riskLevel === 'critical',
  );
  const hasHighIncident = signals.incidents.some(
    (i) => i.severity === 'high' || i.severity === 'critical',
  );
  return hasHighGate || hasHighIncident;
}

/**
 * Returns the count of evidence items that were NOT flagged as warnings
 * (i.e., items that matched known signal entities).
 */
function countMatchedEvidence(validation: ValidationResult): number {
  const totalEvidence = validation.parsed?.evidence.length ?? 0;
  const warnedCount = validation.evidenceWarnings.length;
  return Math.max(0, totalEvidence - warnedCount);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Computes a confidence score for a validated Gemini recommendation.
 *
 * @param validation  - The ValidationResult from the Output Validator.
 *                      Must have isValid === true for a meaningful score.
 *                      Calling this with isValid === false returns score 0.
 * @param signals     - The RelevantSignals used to generate the recommendation.
 * @param retryNeeded - Whether the Gemini Client needed to retry to get this response.
 */
export function computeConfidence(
  validation: ValidationResult,
  signals: RelevantSignals,
  retryNeeded: boolean,
): ConfidenceScore {
  // Degraded path: if the validation failed, score is 0 with a single factor.
  if (!validation.isValid || !validation.parsed) {
    return {
      score: 0,
      tier: 'low',
      breakdown: [
        {
          factor: 'validation_failed',
          impact: -100,
          reason: 'Gemini response failed validation — no reliable score is possible.',
        },
      ],
    };
  }

  const breakdown: ConfidenceBreakdownFactor[] = [];
  let score = BASE_SCORE;

  breakdown.push({
    factor: 'base_score',
    impact: BASE_SCORE,
    reason: 'Starting confidence before adjustments.',
  });

  // ── Penalty: evidence warnings ────────────────────────────────────────────
  const warnCount = validation.evidenceWarnings.length;
  if (warnCount > 0) {
    // Calculate the raw penalty
    const rawPenalty = warnCount * PENALTY_PER_EVIDENCE_WARNING;
    // Apply floor: if applying full penalty would bring score below floor, cap it
    const effectivePenalty = Math.max(rawPenalty, EVIDENCE_WARNING_FLOOR - score);
    score += effectivePenalty; // effectivePenalty is negative
    breakdown.push({
      factor: 'evidence_warning',
      impact: effectivePenalty,
      reason:
        `${warnCount} evidence item${warnCount > 1 ? 's' : ''} could not be matched ` +
        `to any known entity in the provided signals — possible paraphrase or hallucination.`,
    });
  }

  // ── Penalty: Gemini retry ─────────────────────────────────────────────────
  if (retryNeeded) {
    score += PENALTY_RETRY_NEEDED;
    breakdown.push({
      factor: 'retry_needed',
      impact: PENALTY_RETRY_NEEDED,
      reason: 'Gemini required a retry to respond — mild signal of transient instability.',
    });
  }

  // ── Penalty: sparse signals ───────────────────────────────────────────────
  const isSparse = signals.gates.length < 2 && signals.incidents.length < 2;
  if (isSparse) {
    score += PENALTY_SPARSE_SIGNALS;
    breakdown.push({
      factor: 'sparse_signals',
      impact: PENALTY_SPARSE_SIGNALS,
      reason:
        `Fewer than 2 gates and fewer than 2 incidents were available as signal inputs ` +
        `(${signals.gates.length} gate${signals.gates.length !== 1 ? 's' : ''}, ` +
        `${signals.incidents.length} incident${signals.incidents.length !== 1 ? 's' : ''}). ` +
        `Less grounding data generally reduces recommendation reliability.`,
    });
  }

  // ── Penalty: urgency mismatch ─────────────────────────────────────────────
  const claimedCritical = validation.parsed.urgency === 'critical';
  const signalsElevated = signalsHaveElevatedSeverity(signals);
  if (claimedCritical && !signalsElevated) {
    score += PENALTY_URGENCY_MISMATCH;
    breakdown.push({
      factor: 'urgency_mismatch',
      impact: PENALTY_URGENCY_MISMATCH,
      reason:
        'Gemini claimed "critical" urgency but no gate with HIGH or CRITICAL risk and ' +
        'no incident with HIGH or CRITICAL severity was present in the signals — ' +
        'the claimed urgency is not supported by the available data.',
    });
  }

  // ── Penalty: repair needed ────────────────────────────────────────────────
  if (validation.wasRepaired) {
    score += PENALTY_REPAIR_NEEDED;
    breakdown.push({
      factor: 'repair_needed',
      impact: PENALTY_REPAIR_NEEDED,
      reason:
        'Gemini wrapped its JSON in markdown code fences despite instructions not to, ' +
        'requiring a repair pass before parsing. Minor format compliance issue.',
    });
  }

  // ── Bonus: strong corroborating evidence ─────────────────────────────────
  const matchedCount = countMatchedEvidence(validation);
  if (matchedCount >= 3) {
    score += BONUS_STRONG_EVIDENCE;
    breakdown.push({
      factor: 'strong_evidence',
      impact: BONUS_STRONG_EVIDENCE,
      reason:
        `${matchedCount} evidence items matched known signal entities — ` +
        `strong corroboration with provided operational data.`,
    });
  }

  // ── Clamp ─────────────────────────────────────────────────────────────────
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: finalScore,
    tier: scoreToTier(finalScore),
    breakdown,
  };
}
