/**
 * ArenaMind AI Reasoning Pipeline — Public API Surface (Phase 3A + 3B)
 *
 * Phase 3A exports: Signal Filter, Prompt Builder, Gemini Client
 * Phase 3B exports: Output Validator, Confidence Engine, Decision Memory, Orchestrator
 *
 * Route handlers and external callers import from here only.
 */

// Phase 3A
export { filterSignals } from './signal-filter';
export { buildPrompt, GEMINI_OUTPUT_SCHEMA } from './prompt-builder';
export { callGemini, GeminiTimeoutError, GeminiAPIError } from './gemini-client';

// Phase 3B
export { validateGeminiOutput } from './output-validator';
export { computeConfidence } from './confidence-engine';
export {
  addDecisionBrief,
  getByReference,
  getAllDecisionBriefs,
  resetMemory,
  checkForContradiction,
} from './decision-memory';
export { generateDecisionBrief } from './decision-orchestrator';
