/**
 * ArenaMind AI Reasoning Pipeline — Shared Types (Phase 3A + 3B)
 *
 * Phase 3A types:
 *   Signal Filter  → narrows StadiumContext to RelevantSignals
 *   Prompt Builder → converts RelevantSignals to a prompt string
 *   Gemini Client  → sends prompt, returns raw text
 *
 * Phase 3B types:
 *   Output Validator  → parses/validates raw Gemini text → ValidationResult
 *   Confidence Engine → scores reliability → ConfidenceScore
 *   Decision Memory   → stores / retrieves DecisionBriefs
 *   Orchestrator      → wires full pipeline → DecisionBrief
 */

import type {
  Gate,
  Weather,
  Incident,
  AccessibilityAsset,
  Volunteer,
  MedicalResources,
  StadiumMetadata,
} from './stadium-context';

// ─── Decision Trigger ────────────────────────────────────────────────────────

/**
 * What caused this reasoning cycle to run.
 *
 * - "scenario-mutation"  A named scenario (heavy-rain, crowd-surge, medical-incident)
 *                        was just applied, triggering a re-evaluation of impact.
 * - "manual-request"     An operations manager or judge explicitly requested an
 *                        analysis for a specific gate or zone.
 * - "periodic-scan"      A background periodic full-stadium health scan — surfaces
 *                        only what currently needs attention (elevated risk, open
 *                        incidents, out-of-service assets).
 */
export type TriggerType = 'scenario-mutation' | 'manual-request' | 'periodic-scan';

/**
 * The scope/target of the trigger. Identifies which part of the context is
 * being examined:
 *   - A gate ID (e.g., "gate-d")       → gate-scoped analysis
 *   - An incident ID (e.g., "inc-cs-001") → incident-scoped analysis
 *   - "global"                         → full-stadium periodic scan
 */
export type TriggerReference = string; // gate-id | incident-id | "global"

export interface DecisionTrigger {
  triggerType: TriggerType;
  /**
   * What specifically triggered this cycle. Use a gate ID, incident ID, or
   * the literal string "global" for a full-stadium periodic scan.
   */
  reference: TriggerReference;
  /** ISO 8601 timestamp of when this trigger was generated. */
  triggeredAt: string;
  /**
   * Optional human-readable description of why this trigger was generated.
   * Used verbatim in the Prompt Builder's trigger-context section.
   */
  description?: string;
}

// ─── Relevant Signals ────────────────────────────────────────────────────────

/**
 * The output of the Signal Filter: a focused, noise-reduced slice of
 * StadiumContext containing only data plausibly relevant to the trigger.
 *
 * Shape is kept CONSISTENT regardless of trigger type — the same fields always
 * exist, but may be empty arrays or null when not applicable. This allows the
 * Prompt Builder to iterate predictably without branching on trigger type.
 *
 * Size caps enforced by the Signal Filter:
 *   - gates:      max 3 (target gate + up to 2 adjacent/relevant others)
 *   - volunteers: max 5 (zone-matched, highest-priority first)
 *   - incidents:  max 5 (most recent / highest-severity first)
 *   See signal-filter.ts for full cap documentation.
 */
export interface RelevantSignals {
  /** Always included — provides baseline context cheaply. */
  metadata: StadiumMetadata;
  /** Trigger that produced these signals — carried through for Prompt Builder context. */
  trigger: DecisionTrigger;
  /**
   * Gates relevant to this trigger. Capped at 3.
   * For gate triggers: the target gate + up to 2 adjacent/high-risk others.
   * For global scans: all gates above "moderate" risk.
   */
  gates: Gate[];
  /** Always included — weather affects crowd behavior and safety regardless of trigger. */
  weather: Weather;
  /** Incidents relevant to this trigger. Capped at 5. */
  incidents: Incident[];
  /**
   * Accessibility assets relevant to this trigger.
   * null when not applicable (e.g., non-gate global scans with no out-of-service assets).
   */
  accessibilityAssets: AccessibilityAsset[] | null;
  /**
   * Medical resources summary. null when not relevant to this trigger.
   * Included for: medical-type incidents, global scans with activeMedicalIncidents > 0,
   * and any crowd-surge triggers (pre-emptive medic awareness).
   */
  medicalResources: MedicalResources | null;
  /**
   * Zone-matched volunteers. Capped at 5.
   * Sorted by operational status: available > assigned > on-break > off-duty.
   */
  volunteers: Volunteer[];
}

// ─── Gemini Response Schema ───────────────────────────────────────────────────

/**
 * The JSON schema Gemini is instructed to respond with in every prompt.
 * Phase 3A returns the raw string — this type is the PARSING TARGET for
 * Phase 3B's Output Validator. Defined here so Phase 3B has a stable import.
 *
 * Every field is required; Gemini is explicitly instructed not to omit any.
 */
export interface GeminiResponseSchema {
  /**
   * A single, clear, actionable sentence describing what operations staff
   * should do right now. No hedging, no "it depends".
   */
  recommendation: string;
  /**
   * 2–4 sentence explanation of why this recommendation is appropriate, citing
   * evidence from the provided signals only. No fabricated facts.
   */
  reasoning: string;
  /**
   * Specific facts from the provided data that support the recommendation.
   * Each string must reference a real data point (e.g., "Gate D occupancy at 97%").
   * Must NOT include invented statistics or names not present in the signals.
   */
  evidence: string[];
  /**
   * Operational urgency of the recommendation.
   * low       → awareness only, no immediate action required
   * moderate  → action advisable within the next 15–30 minutes
   * high      → action required within the next 5–15 minutes
   * critical  → immediate action required now
   */
  urgency: 'low' | 'moderate' | 'high' | 'critical';
  /**
   * A short, ordered list of concrete steps operations staff should take.
   * Each string should be a discrete, actionable instruction.
   * Typically 2–5 items.
   */
  suggestedActions: string[];
}

/**
 * The raw, unparsed text returned by callGemini().
 * In Phase 3A this is passed through as-is.
 * Phase 3B's Output Validator will JSON.parse() this into GeminiResponseSchema.
 */
export type GeminiRawResponse = string;

// ─── Phase 3B: Output Validator ──────────────────────────────────────────────

/**
 * Result of running a raw Gemini response through the Output Validator.
 *
 * If isValid is false, parsed will be undefined and validationErrors will
 * contain human-readable descriptions of why it failed.
 *
 * evidenceWarnings are populated even when isValid is true — they indicate
 * evidence strings that could not be substring-matched to any entity in the
 * provided RelevantSignals. They do not invalidate the response but reduce
 * the confidence score. See output-validator.ts for the heuristic details.
 */
export interface ValidationResult {
  isValid: boolean;
  parsed: GeminiResponseSchema | undefined;
  validationErrors: string[];
  evidenceWarnings: string[];
  /** Whether the raw string required a markdown-fence repair pass before parsing. */
  wasRepaired: boolean;
}

// ─── Phase 3B: Confidence Engine ─────────────────────────────────────────────

/**
 * A single factor that contributed to the final confidence score.
 * The breakdown array is returned alongside the score so the Judge Experience
 * can render a transparent, per-factor explanation of why a recommendation
 * scored as it did.
 */
export interface ConfidenceBreakdownFactor {
  factor: string;
  impact: number;
  reason: string;
}

/**
 * Confidence tier thresholds (documented here for global reference):
 *   score 80-100  → "high"
 *   score 50-79   → "moderate"
 *   score 0-49    → "low"
 */
export type ConfidenceTier = 'low' | 'moderate' | 'high';

export interface ConfidenceScore {
  score: number;
  tier: ConfidenceTier;
  breakdown: ConfidenceBreakdownFactor[];
}

// ─── Phase 3B: Decision Brief ─────────────────────────────────────────────────

/**
 * The final artifact produced by the Decision Orchestrator.
 * isValid === false means the orchestrator was unable to obtain a valid AI
 * response even after one regeneration attempt. The brief is still returned
 * (never throws) but with null recommendation fields and confidence score 0.
 */
export interface DecisionBrief {
  id: string;
  trigger: DecisionTrigger;
  generatedAt: string;
  isValid: boolean;
  recommendation: string | null;
  reasoning: string | null;
  evidence: string[];
  urgency: GeminiResponseSchema['urgency'] | null;
  suggestedActions: string[];
  confidence: ConfidenceScore;
  validationErrors: string[];
  evidenceWarnings: string[];
  contradictionWarning: string | null;

  // Walkthrough pipeline intermediate artifacts (Option A)
  signals?: RelevantSignals;
  prompt?: string;
  rawResponse?: string;
}
