/**
 * Scenario Routes
 *
 * POST /api/scenarios/heavy-rain       — Applies the Heavy Rain scenario.
 * POST /api/scenarios/crowd-surge      — Applies the Crowd Surge scenario.
 * POST /api/scenarios/medical-incident — Applies the Medical Incident scenario.
 *
 * Phase 3B integration: after each scenario mutation succeeds, an appropriate
 * DecisionTrigger is automatically constructed and passed to the Decision
 * Orchestrator. The response now includes BOTH the updated StadiumContext AND
 * the resulting DecisionBrief, giving every scenario trigger an immediate AI
 * recommendation:
 *   { context: StadiumContext, decisionBrief: DecisionBrief }
 *
 * The scenario mutation logic itself is unchanged from Phase 2 — only the
 * Orchestrator call is added after the mutation.
 *
 * Trigger references used per scenario:
 *   heavy-rain       → "global" (weather affects all gates simultaneously)
 *   crowd-surge      → "gate-d" (crowd surge is anchored to Gate D)
 *   medical-incident → "gate-c" (medical incident is anchored to Gate C)
 */

import { Router, Request, Response } from 'express';
import {
  applyScenario_HeavyRain,
  applyScenario_CrowdSurge,
  applyScenario_MedicalIncident,
} from '../engine/context';
import { generateDecisionBrief } from '../engine/reasoning';
import { success } from '../utils/response';
import type { DecisionTrigger } from '../types/reasoning';

const router = Router();

// ─── POST /api/scenarios/heavy-rain ──────────────────────────────────────────

/**
 * Simulates a severe weather event affecting the stadium.
 * Trigger scope: "global" — heavy rain affects all gates, not just one.
 */
router.post('/heavy-rain', async (_req: Request, res: Response) => {
  const context = applyScenario_HeavyRain();

  const trigger: DecisionTrigger = {
    triggerType: 'scenario-mutation',
    reference: 'global',
    triggeredAt: new Date().toISOString(),
    description:
      'Heavy Rain scenario applied — severe weather now affecting all gates. ' +
      'Global operational impact assessment requested.',
  };

  const decisionBrief = await generateDecisionBrief(trigger);

  res.json(success({ context, decisionBrief }));
});

// ─── POST /api/scenarios/crowd-surge ─────────────────────────────────────────

/**
 * Simulates a crowd surge event at Gate D.
 * Trigger scope: "gate-d" — crowd surge is anchored to Gate D.
 */
router.post('/crowd-surge', async (_req: Request, res: Response) => {
  const context = applyScenario_CrowdSurge();

  const trigger: DecisionTrigger = {
    triggerType: 'scenario-mutation',
    reference: 'gate-d',
    triggeredAt: new Date().toISOString(),
    description:
      'Crowd Surge scenario applied — Gate D occupancy is critical, ' +
      'medical resources have been pre-deployed. Immediate Gate D assessment requested.',
  };

  const decisionBrief = await generateDecisionBrief(trigger);

  res.json(success({ context, decisionBrief }));
});

// ─── POST /api/scenarios/medical-incident ────────────────────────────────────

/**
 * Simulates a multi-patient medical emergency at Gate C.
 * Trigger scope: "gate-c" — medical incident is anchored to Gate C.
 */
router.post('/medical-incident', async (_req: Request, res: Response) => {
  const context = applyScenario_MedicalIncident();

  const trigger: DecisionTrigger = {
    triggerType: 'scenario-mutation',
    reference: 'gate-c',
    triggeredAt: new Date().toISOString(),
    description:
      'Medical Incident scenario applied — multi-patient emergency at Gate C. ' +
      'Medical resource and volunteer status assessment requested.',
  };

  const decisionBrief = await generateDecisionBrief(trigger);

  res.json(success({ context, decisionBrief }));
});

export default router;
