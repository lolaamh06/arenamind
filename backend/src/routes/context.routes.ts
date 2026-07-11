/**
 * Context Routes
 *
 * GET  /api/context        — Returns the full current stadium context.
 * POST /api/context/reset  — Resets the context to the baseline seed state.
 */

import { Router, Request, Response } from 'express';
import { getContext, resetContext } from '../engine/context';
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
 * Resets the context to the validated baseline seed data.
 * Returns the reset context so callers can confirm the new state.
 */
router.post('/reset', (_req: Request, res: Response) => {
  const context = resetContext();
  res.json(success(context));
});

export default router;
