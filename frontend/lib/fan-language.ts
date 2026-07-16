/**
 * ArenaMind Fan Language Translation Utility (Phase 4B-2)
 *
 * RESPONSIBILITY:
 * Translates raw operational, technical metrics into reassuring, plain-language
 * descriptions for spectators. Softens warnings to keep spectators informed
 * without triggering panic.
 *
 * HARD EXCLUSION SECURITY RULE:
 * Fan Portal MUST NEVER render incident lists, medicalResource details, or volunteer
 * names. These are technical operations-only indicators and represent security or
 * privacy leaks if surfaced to fans.
 */

import { RiskLevel, DecisionBrief } from '../types';

/**
 * Translates raw Gate Risk Levels into a soft, descriptive phrase.
 * Hides risk scale terms and numeric percentages.
 */
export function translateGateRisk(risk: RiskLevel): string {
  switch (risk) {
    case 'low':
      return 'Flowing smoothly';
    case 'moderate':
      return 'A bit busy — standard entry times';
    case 'high':
      return 'Busier than usual — allow extra time';
    case 'critical':
      return 'Very busy right now — consider an alternate gate if possible';
    default:
      return 'Operational';
  }
}

/**
 * Strips technical/internal details (such as volunteer names, station references)
 * from recommendation text. Expresses advice in clear passenger navigation terms.
 */
export function translateDecisionBrief(brief: DecisionBrief | null): string {
  if (!brief || !brief.isValid || !brief.recommendation) {
    return 'Everything is running smoothly right now. Have a great match!';
  }

  let text = brief.recommendation;

  // 1. Clean up operational / internal names (Volunteer reference names, etc.)
  // e.g. "support Tobias Eriksen" -> "support staff"
  // Let's do regex patterns to target names or common volunteer labels
  text = text.replace(/support (?:the )?[A-Z][a-z]+ [A-Z][a-z]+/g, 'support gate staff');
  text = text.replace(/assist (?:volunteer )?[A-Z][a-z]+ [A-Z][a-z]+/g, 'assist crowd volunteers');
  text = text.replace(/[A-Z][a-z]+ [A-Z][a-z]+/g, 'stadium crew'); // fallback broad filter for any remaining capitalized name pairs

  // 2. Translate technical directives into helpful advisory tips
  // Operations: "Divert oncoming Metro arrivals to Gate D and dispatch 4 additional volunteers to Gate C"
  // Fan: "Spectators arriving via East Metro are advised to walk to Gate D to bypass Gate C queues."
  if (text.toLowerCase().includes('divert') || text.toLowerCase().includes('redirect')) {
    // If it mentions specific gates, simplify it
    const gateMatches = text.match(/Gate\s+[A-H]/gi);
    if (gateMatches && gateMatches.length >= 2) {
      const busyGate = gateMatches[0];
      const targetGate = gateMatches[1];
      return `${busyGate} is currently experiencing high volumes. We recommend entering via ${targetGate} for faster access.`;
    }
  }

  // 3. Fallback translation cleanup
  // Make sure it reads nicely and doesn't sound like a radio dispatch command
  text = text.replace(/Deploy additional crowd management staff to/i, 'Extra assistance teams are stationed at');
  text = text.replace(/Coordinate immediately with/i, 'Expect assistance from');
  text = text.replace(/utilizing the assigned crowd control volunteers/i, 'guided by our volunteers');
  text = text.replace(/undergoing critical surge/i, 'currently busy');

  // Strip references to turnstiles, telemetry nodes, or status feeds
  text = text.replace(/turnstile mechanical defect/gi, 'temporary lane restrictions');
  text = text.replace(/elevator status node/gi, 'elevator maintenance');

  return text;
}

/**
 * Translates weather enums/intensity into simple, practical fan advice.
 */
export function translateWeather(condition: string, rainIntensity: number): string {
  const cond = condition.toLowerCase();

  if (cond.includes('rain') || rainIntensity > 2) {
    if (rainIntensity > 6) {
      return 'Heavy rain falling. Covered walkways and concourse shelter canopies are active.';
    }
    return 'Light showers expected. Waterproof wear is recommended in open sections.';
  }

  if (cond.includes('clear') || cond.includes('sunny')) {
    return 'Sunny and clear. Enjoy the match!';
  }

  if (cond.includes('cloudy')) {
    return 'Overcast skies. Comfortable temperature for the match.';
  }

  return 'Enjoy your time at the stadium!';
}

/**
 * Translates raw accessibility enums to helpful navigation strings.
 */
export function translateAccessibilityStatus(type: string, status: string, location: string): string {
  const normType = type.toLowerCase();
  const normStatus = status.toLowerCase();
  const loc = location.replace('Gate ', 'Gate ');

  if (normStatus === 'out-of-service') {
    if (normType === 'elevator') {
      return `Elevator near ${loc} is temporarily offline. Please use the adjacent ramp or nearest helper station.`;
    }
    return `Access ramp near ${loc} is temporarily restricted. Please follow staff directions.`;
  }

  if (normStatus === 'busy') {
    return `${type} at ${loc} is currently busy. Expect short queues.`;
  }

  return `${type} at ${loc} is operational and flowing smoothly.`;
}

/**
 * Translates raw Amenity statuses into plain, friendly spectator phrasing.
 */
export function translateAmenityStatus(status: 'open' | 'busy' | 'closed'): string {
  switch (status) {
    case 'open':
      return 'Open — fast service';
    case 'busy':
      return "Line's a bit long right now";
    case 'closed':
      return 'Closed at the moment — try another stand nearby';
    default:
      return 'Available';
  }
}

/**
 * Softens match event names for the timeline feed.
 */
export function translateMatchEventType(type: string): string {
  switch (type) {
    case 'goal':
      return '⚽ Goal scored!';
    case 'yellow-card':
      return '🟨 Caution warning issued';
    case 'red-card':
      return '🟥 Direct ejection warning';
    case 'substitution':
      return '🔄 Player rotation';
    case 'var-review':
      return '🖥️ Play validation review';
    default:
      return '📢 Match event';
  }
}
