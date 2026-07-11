/**
 * Scenario Routes
 *
 * POST /api/scenarios/heavy-rain       — Applies the Heavy Rain scenario.
 * POST /api/scenarios/crowd-surge      — Applies the Crowd Surge scenario.
 * POST /api/scenarios/medical-incident — Applies the Medical Incident scenario.
 *
 * All three endpoints:
 *   - Accept POST with no required body.
 *   - Return the mutated StadiumContext in the success envelope.
 *   - Are idempotent — calling the same scenario multiple times is safe.
 */

import { Router, Request, Response } from 'express';
import {
  applyScenario_HeavyRain,
  applyScenario_CrowdSurge,
  applyScenario_MedicalIncident,
} from '../engine/context';
import { success } from '../utils/response';

const router = Router();

/**
 * POST /api/scenarios/heavy-rain
 * Simulates a severe weather event affecting the stadium.
 */
router.post('/heavy-rain', (_req: Request, res: Response) => {
  const context = applyScenario_HeavyRain();
  res.json(success(context));
});

/**
 * POST /api/scenarios/crowd-surge
 * Simulates a crowd surge event at Gate D.
 */
router.post('/crowd-surge', (_req: Request, res: Response) => {
  const context = applyScenario_CrowdSurge();
  res.json(success(context));
});

/**
 * POST /api/scenarios/medical-incident
 * Simulates a multi-patient medical emergency at Gate C.
 */
router.post('/medical-incident', (_req: Request, res: Response) => {
  const context = applyScenario_MedicalIncident();
  res.json(success(context));
});

export default router;
