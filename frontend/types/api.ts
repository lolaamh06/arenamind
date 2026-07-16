/**
 * ArenaMind Shared Frontend Types (Phase 4A)
 *
 * Declared on the frontend to structurally match the backend API responses
 * while maintaining clean architectural separation across the boundary.
 */

// ─── Stadium Twin / Context Types ───────────────────────────────────────────

export interface StadiumMetadata {
  name: string;
  city: string;
  country: string;
  totalCapacity: number;
  currentAttendance: number;
  matchName: string;
  homeTeam: string;
  awayTeam: string;
  matchPhase: 'pre-match' | 'first-half' | 'half-time' | 'second-half' | 'post-match';
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type TrendDirection = 'increasing' | 'stable' | 'decreasing';

export interface Gate {
  id: string;
  displayName: string;
  status: 'open' | 'closed' | 'restricted';
  servedSections: string[];
  occupancyPercent: number;
  queueEstimate: number;
  riskLevel: RiskLevel;
  trend: TrendDirection;
}

export interface Weather {
  condition: string;
  temperatureCelsius: number;
  rainIntensity: number; // 0 to 10 scale
  windSpeedKph: number;
  comfortIndicator: 'comfortable' | 'mild-heat' | 'extreme-heat' | 'cold' | 'humid' | 'rain-disruptive';
}

export type TransportStatus = 'normal' | 'busy' | 'delayed' | 'suspended';

export interface TransportHub {
  id: string;
  name: string;
  type: 'metro' | 'bus' | 'taxi-rideshare' | 'parking';
  status: TransportStatus;
  occupancyPercent: number | null;
  estimatedWaitMinutes: number;
}

export interface Transport {
  hubs: TransportHub[];
  generalAdvisory: string;
}

export interface Incident {
  id: string;
  incidentType: 'crowd-surge' | 'medical' | 'infrastructure' | 'security' | 'weather-delay';
  severity: RiskLevel;
  status: 'reported' | 'first-responders-dispatched' | 'active-response' | 'resolved';
  displayLocation: string;
  locationReference: string; // gate-id, zone-id, section-id
  reportedAt: string;
  description: string;
}

export interface AccessibilityAsset {
  id: string;
  assetType: 'elevator' | 'escalator' | 'wheelchair-ramp' | 'accessible-shuttle';
  status: 'operational' | 'out-of-service' | 'busy';
  displayLocation: string;
  locationReference: string; // gate-id, zone-id
  waitEstimateMinutes: number | null;
}

export interface Volunteer {
  id: string;
  displayName: string;
  status: 'available' | 'assigned' | 'on-break' | 'off-duty';
  assignedZone: string; // e.g. "Gate A", "Section 102"
  currentTask: string;
}

export interface MedicalStation {
  id: string;
  displayLocation: string;
  locationReference: string;
}

export interface MedicalResources {
  totalMedics: number;
  availableMedics: number;
  totalAmbulances: number;
  availableAmbulances: number;
  activeMedicalIncidents: number;
  stations: MedicalStation[];
}

// ─── Match Info Types ─────────────────────────────────────────────────────────

/**
 * A single entry in a team's simplified lineup.
 * Names are entirely fictional — no real footballers are referenced.
 */
export interface PlayerEntry {
  name: string;
  position: string;
}

/**
 * A notable match event (goal, card, substitution, etc.) logged so far.
 */
export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow-card' | 'red-card' | 'substitution' | 'var-review';
  description: string;
}

/**
 * Live (simulated) match state.
 * matchMinute is a static baseline value nudged forward by scenario mutations.
 */
export interface MatchInfo {
  homeScore: number;
  awayScore: number;
  /** Elapsed match time in minutes. Nudged forward by scenario mutations. */
  matchMinute: number;
  homeLineup: PlayerEntry[];
  awayLineup: PlayerEntry[];
  recentEvents: MatchEvent[];
}

// ─── Amenity Types ────────────────────────────────────────────────────────────

/**
 * Category of an amenity stand.
 * NOTE: Restrooms are excluded — they are modelled under AccessibilityAssets
 * to avoid duplicating the same physical asset across two data sections.
 */
export type AmenityType = 'food' | 'beverage' | 'merchandise';
export type AmenityStatus = 'open' | 'busy' | 'closed';

export interface Amenity {
  id: string;
  name: string;
  type: AmenityType;
  status: AmenityStatus;
  locationReference: string;
  displayLocation: string;
  description?: string;
}

export interface StadiumContext {
  metadata: StadiumMetadata;
  gates: Gate[];
  weather: Weather;
  transport: Transport;
  incidents: Incident[];
  accessibilityAssets: AccessibilityAsset[];
  medicalResources: MedicalResources;
  volunteers: Volunteer[];
  /** Phase 4C-1: Live (simulated) match state — score, clock, lineups, and recent events. */
  matchInfo: MatchInfo;
  /** Phase 4C-1: Food, beverage, and merchandise concession stands around the venue. */
  amenities: Amenity[];
}

// ─── AI Reasoning / Decision Types ──────────────────────────────────────────

export type TriggerType = 'scenario-mutation' | 'manual-request' | 'periodic-scan';

export interface DecisionTrigger {
  triggerType: TriggerType;
  reference: string;
  triggeredAt: string;
  description?: string;
}

export interface ConfidenceBreakdownFactor {
  factor: string;
  impact: number;
  reason: string;
}

export interface ConfidenceScore {
  score: number;
  tier: 'low' | 'moderate' | 'high';
  breakdown: ConfidenceBreakdownFactor[];
}

export interface RelevantSignals {
  metadata: StadiumMetadata;
  trigger: DecisionTrigger;
  gates: Gate[];
  weather: Weather;
  incidents: Incident[];
  accessibilityAssets: AccessibilityAsset[] | null;
  medicalResources: MedicalResources | null;
  volunteers: Volunteer[];
}

export interface DecisionBrief {
  id: string;
  trigger: DecisionTrigger;
  generatedAt: string;
  isValid: boolean;
  recommendation: string | null;
  reasoning: string | null;
  evidence: string[];
  urgency: 'low' | 'moderate' | 'high' | 'critical' | null;
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


// ─── API Envelope Shape ──────────────────────────────────────────────────────

export interface ApiResponseEnvelope<T> {
  status: 'success' | 'error';
  timestamp: string;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ScenarioResponse {
  context: StadiumContext;
  decisionBrief: DecisionBrief;
}

export interface ResetResponse {
  context: StadiumContext;
  decisionBrief: null;
}
