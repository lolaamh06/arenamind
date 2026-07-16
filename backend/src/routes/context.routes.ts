/**
 * Context Routes
 *
 * GET  /api/context        — Returns the full current stadium context.
 * POST /api/context/reset  — Resets the context to the baseline seed state AND
 *                            clears Decision Memory so that GET /api/decisions/history
 *                            returns an empty array immediately after reset.
 *                            Response: { context: StadiumContext, decisionBrief: null }
 */

import { Router, Request, Response } from 'express';
import { getContext, resetContext } from '../engine/context';
import { resetMemory } from '../engine/reasoning';
import { success } from '../utils/response';

const router = Router();

/**
 * GET /api/context
 * Returns the full current StadiumContext in the standard success envelope.
 */
router.get('/', (_req: Request, res: Response) => {
  const context = getContext();
  res.json(success(context));
});

/**
 * POST /api/context/reset
 * Resets BOTH the StadiumContext (to the validated baseline seed) AND Decision
 * Memory (clears all stored briefs) atomically. "Start the demo over from a clean
 * slate" in every sense — not just gate/weather values.
 *
 * Returns { context, decisionBrief: null } so the frontend can immediately
 * reflect the cleared state without waiting for the next poll cycle.
 */
router.post('/reset', (_req: Request, res: Response) => {
  const context = resetContext();
  resetMemory();
  res.json(success({ context, decisionBrief: null }));
});

export default router;
