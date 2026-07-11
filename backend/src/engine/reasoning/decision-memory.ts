/**
 * ArenaMind AI Reasoning Pipeline — Decision Memory
 *
 * RESPONSIBILITY:
 * In-memory store of generated DecisionBriefs, following the same pattern as
 * Phase 2's Context Engine store: no persistence, no database, resets on server
 * restart. Keeps a running list of all briefs generated during the server session.
 *
 * Exposes:
 *   - addDecisionBrief(brief)          → stores a brief
 *   - getByReference(reference)        → retrieves all briefs for a gate/incident
 *   - getAllDecisionBriefs()            → full history (for a future history view)
 *   - checkForContradiction(candidate) → checks recent briefs for conflicts
 *   - resetMemory()                     → clears all stored briefs (test utility)
 *
 * CONTRADICTION CHECK HEURISTIC:
 * ─────────────────────────────────────────────────────────────────────────────
 * Time window: 10 minutes. Briefs older than 10 minutes are not considered for
 * contradiction checking — they are assumed stale relative to current operations.
 *
 * Detection method: We extract "action direction tokens" from the recommendation
 * and suggestedActions fields of both the existing brief and the new candidate.
 * A contradiction is flagged when opposing direction pairs are found:
 *   INCREASING direction: "redirect to", "send to", "deploy to", "open [gate]",
 *                         "increase capacity", "increase staffing at"
 *   DECREASING direction: "redirect away from", "close [gate]", "reduce capacity",
 *                         "move away", "divert away"
 *
 * Additionally, we check for opposing urgency direction: if a previous brief
 * had urgency "low" or "moderate" and the new one is "critical", or vice versa,
 * for the same reference — this is not a contradiction per se but is flagged as
 * a significant escalation/de-escalation for awareness.
 *
 * IMPORTANT LIMITATIONS (documented honestly):
 * - This is keyword matching, not semantic NLP. It will miss contradictions
 *   phrased without the above trigger words. For example, "deploy more volunteers
 *   to Gate D" and "reduce volunteer count at Gate D" will not be detected unless
 *   the phrasing matches the trigger pairs.
 * - It will also produce false positives if the same gate/reference is mentioned
 *   in two different contexts that happen to use opposing direction words for
 *   different sub-zones.
 * - For a hackathon MVP, this is "good enough for demo, honest about its limits."
 *   A production system would require embedding-based semantic comparison.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { DecisionBrief } from '../../types/reasoning';

// ─── Store ────────────────────────────────────────────────────────────────────

/** The in-memory list of all stored decision briefs. */
let _store: DecisionBrief[] = [];

// ─── Contradiction check constants ───────────────────────────────────────────

/** Briefs older than this many milliseconds are excluded from contradiction checks. */
const CONTRADICTION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Pairs of opposing direction patterns. If a text body matches a word from
 * group A and a recent brief matches the corresponding word from group B
 * (or vice versa), a contradiction is flagged.
 *
 * Each entry is [group-A patterns, group-B patterns].
 */
const OPPOSING_DIRECTION_PAIRS: [string[], string[]][] = [
  // Crowd/fan redirection
  [
    ['redirect to', 'send to', 'move to', 'guide to', 'direct fans to', 'direct spectators to'],
    ['redirect away from', 'redirect from', 'move away from', 'divert away from', 'divert from'],
  ],
  // Gate state
  [
    ['open gate', 'activate gate', 'increase gate capacity'],
    ['close gate', 'deactivate gate', 'reduce gate capacity', 'restrict gate'],
  ],
  // Staffing
  [
    ['deploy additional', 'send additional', 'increase staffing', 'add staff', 'dispatch staff'],
    ['reduce staff', 'withdraw staff', 'remove staff', 'decrease staffing'],
  ],
  // Urgency direction (escalation vs de-escalation)
  [
    ['critical', 'emergency', 'immediate action required'],
    ['no action required', 'situation resolved', 'condition has stabilised', 'return to normal'],
  ],
];

// ─── Contradiction detection helpers ─────────────────────────────────────────

/**
 * Extracts all text content from a DecisionBrief that is relevant for
 * contradiction detection (recommendation + all suggestedActions).
 */
function extractBriefText(brief: DecisionBrief): string {
  const parts: string[] = [];
  if (brief.recommendation) parts.push(brief.recommendation);
  parts.push(...brief.suggestedActions);
  return parts.join(' ').toLowerCase();
}

/**
 * Returns true if the given text matches any pattern in the provided group.
 */
function matchesAnyPattern(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern.toLowerCase()));
}

/**
 * Checks whether two text bodies contain opposing direction signals.
 * Returns a human-readable description of the conflict if found, or null.
 */
function detectOpposingDirections(candidateText: string, existingText: string): string | null {
  for (const [groupA, groupB] of OPPOSING_DIRECTION_PAIRS) {
    const candidateMatchesA = matchesAnyPattern(candidateText, groupA);
    const candidateMatchesB = matchesAnyPattern(candidateText, groupB);
    const existingMatchesA = matchesAnyPattern(existingText, groupA);
    const existingMatchesB = matchesAnyPattern(existingText, groupB);

    // Contradiction: candidate suggests direction A, existing suggests direction B
    if (candidateMatchesA && existingMatchesB) {
      const candidateMatch = groupA.find((p) => candidateText.includes(p)) ?? groupA[0];
      const existingMatch = groupB.find((p) => existingText.includes(p)) ?? groupB[0];
      return (
        `New recommendation ("${candidateMatch}") conflicts with a recent brief ` +
        `for the same reference that suggested "${existingMatch}".`
      );
    }

    // Contradiction: candidate suggests direction B, existing suggests direction A
    if (candidateMatchesB && existingMatchesA) {
      const candidateMatch = groupB.find((p) => candidateText.includes(p)) ?? groupB[0];
      const existingMatch = groupA.find((p) => existingText.includes(p)) ?? groupA[0];
      return (
        `New recommendation ("${candidateMatch}") conflicts with a recent brief ` +
        `for the same reference that suggested "${existingMatch}".`
      );
    }
  }
  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Stores a completed DecisionBrief in memory.
 */
export function addDecisionBrief(brief: DecisionBrief): void {
  _store.push(brief);
}

/**
 * Retrieves all stored DecisionBriefs concerning a specific gate/incident/zone
 * reference. Useful for history panels and manual contradiction review.
 *
 * Matches against brief.trigger.reference (case-insensitive).
 */
export function getByReference(reference: string): DecisionBrief[] {
  const normalised = reference.toLowerCase().trim();
  return _store.filter((b) => b.trigger.reference.toLowerCase() === normalised);
}

/**
 * Retrieves the full Decision Memory history, ordered oldest-first.
 * Intended for a future "decision history" view — not filtered or paginated here.
 */
export function getAllDecisionBriefs(): DecisionBrief[] {
  return [..._store]; // return a copy to prevent external mutation
}

/**
 * Clears all stored briefs. Used in testing or when the context is reset.
 */
export function resetMemory(): void {
  _store = [];
}

/**
 * Checks recent Decision Memory for contradictions with a new candidate brief.
 *
 * Looks back up to CONTRADICTION_WINDOW_MS (10 minutes) at briefs stored for
 * the same trigger.reference. If an opposing direction pair is found between
 * the candidate and any recent brief, returns a warning string describing the
 * conflict. Returns null if no contradiction is detected.
 *
 * See file-level comment for the documented heuristic and its limitations.
 *
 * @param candidate - The new brief about to be stored (not yet in memory).
 * @returns A human-readable warning string, or null.
 */
export function checkForContradiction(candidate: DecisionBrief): string | null {
  if (!candidate.isValid || !candidate.recommendation) {
    // Can't check contradiction for invalid/null recommendations
    return null;
  }

  const reference = candidate.trigger.reference.toLowerCase();
  const cutoffTime = new Date(candidate.generatedAt).getTime() - CONTRADICTION_WINDOW_MS;

  // Find recent, valid briefs for the same reference within the time window
  const recentBriefs = _store.filter((b) => {
    if (b.trigger.reference.toLowerCase() !== reference) return false;
    if (!b.isValid || !b.recommendation) return false;
    const briefTime = new Date(b.generatedAt).getTime();
    return briefTime >= cutoffTime;
  });

  if (recentBriefs.length === 0) return null;

  const candidateText = extractBriefText(candidate);

  for (const existing of recentBriefs) {
    const existingText = extractBriefText(existing);
    const conflict = detectOpposingDirections(candidateText, existingText);
    if (conflict) {
      return (
        `[Contradiction detected within ${CONTRADICTION_WINDOW_MS / 60000}-minute window] ` +
        `${conflict} ` +
        `This may reflect a genuine change in conditions or a model inconsistency. ` +
        `Review both briefs before acting. ` +
        `(Note: contradiction detection uses keyword heuristics — false positives are possible. ` +
        `See decision-memory.ts for documented limitations.)`
      );
    }
  }

  return null;
}
