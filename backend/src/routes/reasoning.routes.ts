/**
 * Reasoning Pipeline Routes — Phase 3A
 *
 * TEMPORARY ROUTE — FOR PHASE 3A VERIFICATION ONLY.
 * This route exists solely to let us inspect the full reasoning pipeline
 * (Signal Filter → Prompt Builder → Gemini Client) end-to-end before the
 * Decision Orchestrator exists.
 *
 * TO BE REMOVED / REPLACED IN PHASE 3B once the real Decision Orchestrator
 * route replaces this test scaffold.
 */

import { Router, Request, Response } from 'express';
import { getContext } from '../engine/context';
import {
  filterSignals,
  buildPrompt,
  callGemini,
  GeminiTimeoutError,
  GeminiAPIError,
} from '../engine/reasoning';
import { success, failure } from '../utils/response';
import type { DecisionTrigger, TriggerType } from '../types/reasoning';

const router = Router();

// ─── Request shape ────────────────────────────────────────────────────────────

interface TestPromptBody {
  /**
   * Type of trigger to simulate.
   * One of: "scenario-mutation" | "manual-request" | "periodic-scan"
   */
  triggerType: TriggerType;
  /**
   * Scope of the trigger.
   * Examples: "gate-d", "inc-cs-001", "global"
   */
  reference: string;
  /** Optional human-readable description included in the prompt's trigger context. */
  description?: string;
}

// ─── Validation helpers ───────────────────────────────────────────────────────

const VALID_TRIGGER_TYPES: TriggerType[] = ['scenario-mutation', 'manual-request', 'periodic-scan'];

function isValidTriggerType(val: unknown): val is TriggerType {
  return typeof val === 'string' && VALID_TRIGGER_TYPES.includes(val as TriggerType);
}

// ─── Route handler ────────────────────────────────────────────────────────────

/**
 * POST /api/reasoning/test-prompt
 *
 * TEMPORARY — Phase 3A verification only. See file-level comment above.
 *
 * Request body:
 *   { triggerType: string, reference: string, description?: string }
 *
 * Response data:
 *   {
 *     trigger:        DecisionTrigger    — the trigger that was constructed
 *     signals:        RelevantSignals    — output of the Signal Filter
 *     prompt:         string             — the exact prompt sent to Gemini
 *     geminiResponse: string             — raw Gemini response text (unparsed)
 *   }
 *
 * All three of signals, prompt, and geminiResponse are included so the full
 * pipeline can be inspected in a single call for verification and judging.
 */
router.post('/test-prompt', async (req: Request, res: Response) => {
  const body = req.body as Partial<TestPromptBody>;

  // ── Input validation ────────────────────────────────────────────────────────
  if (!isValidTriggerType(body.triggerType)) {
    res
      .status(400)
      .json(
        failure(
          'INVALID_TRIGGER_TYPE',
          `triggerType must be one of: ${VALID_TRIGGER_TYPES.join(', ')}. Received: "${body.triggerType ?? '(missing)'}".`,
        ),
      );
    return;
  }

  if (!body.reference || typeof body.reference !== 'string' || body.reference.trim() === '') {
    res
      .status(400)
      .json(
        failure(
          'MISSING_REFERENCE',
          'reference is required. Use a gate ID (e.g., "gate-d"), an incident ID (e.g., "inc-cs-001"), or "global".',
        ),
      );
    return;
  }

  // ── Build trigger ───────────────────────────────────────────────────────────
  const trigger: DecisionTrigger = {
    triggerType: body.triggerType,
    reference: body.reference.trim().toLowerCase(),
    triggeredAt: new Date().toISOString(),
    description: body.description?.trim(),
  };

  // ── Run pipeline ────────────────────────────────────────────────────────────
  try {
    // 1. Fetch current stadium context from the Context Engine
    const ctx = getContext();

    // 2. Signal Filter — narrow context to only relevant signals
    const signals = filterSignals(ctx, trigger);

    // 3. Prompt Builder — construct the Gemini prompt
    const prompt = buildPrompt(signals);

    // 4. Gemini Client — call Gemini and get raw response
    const geminiResponse = await callGemini(prompt);

    // 5. Return all three for inspection
    res.json(
      success({
        trigger,
        signals,
        prompt,
        geminiResponse,
      }),
    );
  } catch (err) {
    if (err instanceof GeminiTimeoutError) {
      res.status(504).json(failure('GEMINI_TIMEOUT', err.message));
      return;
    }

    if (err instanceof GeminiAPIError) {
      res.status(502).json(failure('GEMINI_API_ERROR', err.message));
      return;
    }

    // Unexpected error
    console.error('[Reasoning Route] Unexpected error:', err);
    res
      .status(500)
      .json(
        failure(
          'INTERNAL_SERVER_ERROR',
          err instanceof Error ? err.message : 'An unexpected error occurred.',
        ),
      );
  }
});

export default router;
