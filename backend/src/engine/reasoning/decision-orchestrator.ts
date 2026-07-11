/**
 * ArenaMind AI Reasoning Pipeline — Decision Orchestrator
 *
 * RESPONSIBILITY:
 * Wires the entire 10-step AI reasoning pipeline together into a single
 * generateDecisionBrief() function. Takes a DecisionTrigger, returns a
 * complete, validated, confidence-scored, memory-checked DecisionBrief.
 *
 * PIPELINE (must execute in exactly this order):
 *   1. Fetch current StadiumContext from the Context Engine
 *   2. Run through Signal Filter → RelevantSignals
 *   3. Build prompt via Prompt Builder → prompt string
 *   4. Call Gemini Client → raw response string (track retry)
 *   5. Run Output Validator on raw response
 *      → If invalid: regenerate once with augmented prompt
 *      → If still invalid: return graceful failure DecisionBrief
 *   6. Run Confidence Engine → ConfidenceScore
 *   7. Check Decision Memory for contradictions
 *   8. Assemble DecisionBrief
 *   9. Store in Decision Memory
 *  10. Return
 *
 * FAILURE MODES:
 * The orchestrator NEVER throws an unhandled exception. All failure modes
 * (Gemini timeout, network error, repeated validation failure) degrade to a
 * clearly marked failure DecisionBrief with isValid: false. The server
 * continues operating normally.
 */

import { randomUUID } from 'crypto';
import { getContext } from '../context';
import { filterSignals } from './signal-filter';
import { buildPrompt, GEMINI_OUTPUT_SCHEMA } from './prompt-builder';
import { callGemini, GeminiTimeoutError, GeminiAPIError } from './gemini-client';
import { validateGeminiOutput } from './output-validator';
import { computeConfidence } from './confidence-engine';
import { addDecisionBrief, checkForContradiction } from './decision-memory';
import type {
  DecisionTrigger,
  DecisionBrief,
  RelevantSignals,
  ConfidenceScore,
} from '../../types/reasoning';

// ─── Null confidence (for failure briefs) ────────────────────────────────────

const NULL_CONFIDENCE: ConfidenceScore = {
  score: 0,
  tier: 'low',
  breakdown: [
    {
      factor: 'pipeline_failure',
      impact: -100,
      reason:
        'No valid AI response was obtained after one regeneration attempt. ' +
        'Confidence score is meaningless in this state.',
    },
  ],
};

// ─── Augmented regeneration prompt ───────────────────────────────────────────

/**
 * Builds a second-attempt prompt that includes an explicit note about the
 * first attempt's failure. This gives Gemini explicit feedback that its previous
 * response was malformed and reinforces the schema constraint.
 */
function buildRegenerationPrompt(basePrompt: string, validationErrors: string[]): string {
  const errorSummary = validationErrors.slice(0, 3).join('; ');
  return (
    `IMPORTANT: Your previous response was rejected because it failed JSON schema validation.\n` +
    `Validation errors: ${errorSummary}\n` +
    `You MUST respond with ONLY a valid JSON object matching the schema below. ` +
    `No markdown code fences, no preamble, no explanation outside the JSON.\n` +
    `Required schema:\n${GEMINI_OUTPUT_SCHEMA}\n\n` +
    `─────────────────────────────────\n` +
    `Original prompt follows:\n\n` +
    basePrompt
  );
}

// ─── Graceful failure brief ───────────────────────────────────────────────────

/**
 * Constructs a clearly-marked failure DecisionBrief when the orchestrator
 * cannot obtain a valid AI response. Never stores this in Decision Memory.
 */
function buildFailureBrief(
  trigger: DecisionTrigger,
  errors: string[],
  cause?: string,
): DecisionBrief {
  return {
    id: randomUUID(),
    trigger,
    generatedAt: new Date().toISOString(),
    isValid: false,
    recommendation: null,
    reasoning: null,
    evidence: [],
    urgency: null,
    suggestedActions: [],
    confidence: NULL_CONFIDENCE,
    validationErrors: cause ? [...errors, cause] : errors,
    evidenceWarnings: [],
    contradictionWarning: null,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Runs the full 10-step AI reasoning pipeline for a given DecisionTrigger.
 *
 * Returns a DecisionBrief regardless of outcome — never throws.
 * If the pipeline fails at any step, returns a failure brief with isValid: false
 * and detailed error information in validationErrors.
 */
export async function generateDecisionBrief(trigger: DecisionTrigger): Promise<DecisionBrief> {
  let signals: RelevantSignals;
  let basePrompt: string;

  // ── Step 1 & 2: Context Engine → Signal Filter ─────────────────────────────
  try {
    const ctx = getContext();
    signals = filterSignals(ctx, trigger);
  } catch (err) {
    console.error('[Orchestrator] Context/Signal Filter error:', err);
    return buildFailureBrief(
      trigger,
      ['Failed to fetch or filter stadium context.'],
      err instanceof Error ? err.message : String(err),
    );
  }

  // ── Step 3: Prompt Builder ─────────────────────────────────────────────────
  try {
    basePrompt = buildPrompt(signals);
  } catch (err) {
    console.error('[Orchestrator] Prompt Builder error:', err);
    return buildFailureBrief(
      trigger,
      ['Failed to build Gemini prompt.'],
      err instanceof Error ? err.message : String(err),
    );
  }

  // ── Steps 4 & 5: Gemini Call → Validate (with one regeneration attempt) ────
  let rawResponse: string;
  let retryNeeded = false;

  // First attempt
  try {
    rawResponse = await callGemini(basePrompt);
  } catch (err) {
    const errMsg =
      err instanceof GeminiTimeoutError
        ? `Gemini request timed out: ${err.message}`
        : err instanceof GeminiAPIError
          ? `Gemini API error: ${err.message}`
          : `Unexpected error calling Gemini: ${err instanceof Error ? err.message : String(err)}`;
    console.error('[Orchestrator] Gemini call failed (attempt 1):', errMsg);
    return buildFailureBrief(trigger, [errMsg]);
  }

  let validation = validateGeminiOutput(rawResponse, signals);

  // If first attempt invalid → one regeneration pass
  if (!validation.isValid) {
    console.warn(
      `[Orchestrator] First Gemini response failed validation. ` +
        `Errors: ${validation.validationErrors.join('; ')}. ` +
        `Attempting regeneration...`,
    );
    retryNeeded = true;
    const regenPrompt = buildRegenerationPrompt(basePrompt, validation.validationErrors);

    let regenResponse: string;
    try {
      regenResponse = await callGemini(regenPrompt);
    } catch (err) {
      const errMsg =
        err instanceof GeminiTimeoutError
          ? `Gemini timed out on regeneration attempt: ${err.message}`
          : `Gemini API error on regeneration attempt: ${err instanceof Error ? err.message : String(err)}`;
      console.error('[Orchestrator] Gemini regeneration failed:', errMsg);
      return buildFailureBrief(trigger, validation.validationErrors, errMsg);
    }

    validation = validateGeminiOutput(regenResponse, signals);

    if (!validation.isValid) {
      console.error(
        `[Orchestrator] Regeneration also failed validation. ` +
          `Errors: ${validation.validationErrors.join('; ')}.`,
      );
      return buildFailureBrief(trigger, [
        'First attempt: ' + validation.validationErrors.join('; '),
        'Regeneration also failed — returning graceful failure brief.',
      ]);
    }

    console.log('[Orchestrator] Regeneration succeeded.');
  }

  // ── Step 6: Confidence Engine ──────────────────────────────────────────────
  const confidence = computeConfidence(validation, signals, retryNeeded);

  // ── Step 7: Contradiction check ────────────────────────────────────────────
  // Build a preliminary brief for contradiction checking (without yet assigning
  // an ID or storing it — we'll assemble the final brief below).
  const preliminaryBrief: DecisionBrief = {
    id: '', // placeholder, not stored yet
    trigger,
    generatedAt: new Date().toISOString(),
    isValid: true,
    recommendation: validation.parsed!.recommendation,
    reasoning: validation.parsed!.reasoning,
    evidence: validation.parsed!.evidence,
    urgency: validation.parsed!.urgency,
    suggestedActions: validation.parsed!.suggestedActions,
    confidence,
    validationErrors: [],
    evidenceWarnings: validation.evidenceWarnings,
    contradictionWarning: null, // filled in below
  };

  const contradictionWarning = checkForContradiction(preliminaryBrief);

  // ── Step 8: Assemble final DecisionBrief ───────────────────────────────────
  const brief: DecisionBrief = {
    ...preliminaryBrief,
    id: randomUUID(),
    contradictionWarning,
  };

  // ── Step 9: Store in Decision Memory ──────────────────────────────────────
  addDecisionBrief(brief);

  // ── Step 10: Return ────────────────────────────────────────────────────────
  return brief;
}
