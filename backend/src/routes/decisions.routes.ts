/**
 * ArenaMind Decisions Routes — Phase 3B
 *
 * POST /api/decisions/generate
 *   General-purpose "manual request" entry point. Accepts a triggerType and
 *   reference, runs the full Decision Orchestrator, returns the DecisionBrief.
 *   This replaces the temporary /api/reasoning/test-prompt route from Phase 3A.
 *
 * GET /api/decisions/history
 *   Returns the full Decision Memory history (all stored briefs), oldest-first.
 *
 * GET /api/decisions/by-reference/:reference
 *   Returns all decision briefs for a specific gate/incident/zone reference.
 */

import { Router, Request, Response } from 'express';
import { generateDecisionBrief } from '../engine/reasoning';
import { getAllDecisionBriefs, getByReference } from '../engine/reasoning';
import { success, failure } from '../utils/response';
import type { DecisionTrigger, TriggerType } from '../types/reasoning';

const router = Router();

// ─── Shared validation ────────────────────────────────────────────────────────

const VALID_TRIGGER_TYPES: TriggerType[] = ['scenario-mutation', 'manual-request', 'periodic-scan'];

function isValidTriggerType(val: unknown): val is TriggerType {
  return typeof val === 'string' && VALID_TRIGGER_TYPES.includes(val as TriggerType);
}

// ─── POST /api/decisions/generate ────────────────────────────────────────────

interface GenerateBody {
  triggerType: TriggerType;
  reference: string;
  description?: string;
}

router.post('/generate', async (req: Request, res: Response) => {
  const body = req.body as Partial<GenerateBody>;

  if (!isValidTriggerType(body.triggerType)) {
    res
      .status(400)
      .json(
        failure(
          'INVALID_TRIGGER_TYPE',
          `triggerType must be one of: ${VALID_TRIGGER_TYPES.join(', ')}. ` +
            `Received: "${body.triggerType ?? '(missing)'}" .`,
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
          'reference is required. Use a gate ID (e.g., "gate-d"), ' +
            'an incident ID (e.g., "inc-cs-001"), or "global".',
        ),
      );
    return;
  }

  const trigger: DecisionTrigger = {
    triggerType: body.triggerType,
    reference: body.reference.trim().toLowerCase(),
    triggeredAt: new Date().toISOString(),
    description: body.description?.trim(),
  };

  // generateDecisionBrief never throws — always returns a DecisionBrief
  const brief = await generateDecisionBrief(trigger);

  res.json(success(brief));
});

// ─── GET /api/decisions/history ───────────────────────────────────────────────

router.get('/history', (_req: Request, res: Response) => {
  const history = getAllDecisionBriefs();
  res.json(
    success({
      total: history.length,
      briefs: history,
    }),
  );
});

// ─── GET /api/decisions/by-reference/:reference ───────────────────────────────

router.get('/by-reference/:reference', (req: Request, res: Response) => {
  const reference = req.params['reference'];

  if (!reference || reference.trim() === '') {
    res.status(400).json(failure('MISSING_REFERENCE', 'reference path parameter is required.'));
    return;
  }

  const briefs = getByReference(reference.trim().toLowerCase());
  res.json(
    success({
      reference: reference.trim().toLowerCase(),
      total: briefs.length,
      briefs,
    }),
  );
});

export default router;
