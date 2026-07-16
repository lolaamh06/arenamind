/**
 * Canonical TypeScript types for the ArenaMind Digital Stadium Twin.
 * Every backend module and (in later phases) every AI pipeline stage
 * consumes exactly these types. Do not duplicate or re-define them elsewhere.
 */

// ─── Shared primitive unions ────────────────────────────────────────────────

export type TrendIndicator = 'increasing' | 'stable' | 'decreasing';

/**
 * Risk level derived from gate occupancy + trend.
 * Thresholds (documented here and enforced in validator.ts):
 *   occupancy < 60                               → "low"
 *   occupancy 60-79                              → "moderate"
 *   occupancy 80-94                              → "high"
 *   occupancy ≥ 95  OR  (occupancy ≥ 85 AND trend === "increasing")  → "critical"
 */
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type MatchPhase = 'pre-match' | 'first-half' | 'half-time' | 'second-half' | 'post-match';

// ─── Stadium Metadata ───────────────────────────────────────────────────────

export interface StadiumMetadata {
  /** Realistic fictional name — does not represent any real venue. */
  name: string;
  city: string;
  totalCapacity: number;
  /** Must always be ≤ totalCapacity; validated by Context Engine. */
  currentAttendance: number;
  matchName: string;
  homeTeam: string;
  awayTeam: string;
  matchPhase: MatchPhase;
  /** ISO 8601 timestamp representing "now" in the simulation. */
  simulatedTime: string;
}

// ─── Gates & Crowd ──────────────────────────────────────────────────────────

export interface Gate {
  id: string; // e.g., "gate-a"
  displayName: string; // e.g., "Gate A — North Stand"
  /** 0–100. Percentage of the gate's safe-handling capacity currently occupied. */
  occupancyPercent: number;
  trend: TrendIndicator;
  /** Approximate number of people currently in the queue for this gate. */
  queueEstimate: number;
  riskLevel: RiskLevel;
  /** Seating sections served by this gate (used for AI redirection recommendations). */
  servedSections: string[];
}

// ─── Weather ────────────────────────────────────────────────────────────────

export type WeatherCondition = 'clear' | 'cloudy' | 'light-rain' | 'heavy-rain' | 'storm';

export interface Weather {
  condition: WeatherCondition;
  /** Celsius */
  temperatureCelsius: number;
  /** 0 (none) – 10 (torrential). Only meaningful when condition includes rain. */
  rainIntensity: number;
  /** km/h */
  windSpeedKph: number;
  /**
   * Derived comfort indicator. "comfortable" | "warm" | "hot" | "cold" | "unpleasant".
   * Unpleasant covers heavy rain/storm regardless of temperature.
   * Used by AI reasoning to suggest indoor alternatives or shelter guidance.
   */
  comfortIndicator: 'comfortable' | 'warm' | 'hot' | 'cold' | 'unpleasant';
}

// ─── Transport ──────────────────────────────────────────────────────────────

export type TransportStatus = 'normal' | 'busy' | 'delayed' | 'suspended';

export interface TransportHub {
  id: string;
  name: string;
  type: 'metro' | 'bus' | 'taxi-rideshare' | 'parking';
  status: TransportStatus;
  /** 0–100 % utilisation; null for hubs where it's not applicable. */
  occupancyPercent: number | null;
  /** Estimated wait or delay in minutes. */
  estimatedWaitMinutes: number;
}

export interface Transport {
  hubs: TransportHub[];
  /** Overall advisory message surfaced to fans. */
  generalAdvisory: string;
}

// ─── Accessibility ──────────────────────────────────────────────────────────

export type AccessibilityAssetType =
  'elevator' | 'ramp' | 'accessible-restroom' | 'accessible-entrance';

export type AccessibilityStatus = 'operational' | 'out-of-service' | 'busy';

export interface AccessibilityAsset {
  id: string;
  assetType: AccessibilityAssetType;
  status: AccessibilityStatus;
  /** Which gate or zone this asset is adjacent to. */
  locationReference: string;
  displayLocation: string;
  /** Estimated wait in minutes. null when not applicable or not operational. */
  waitEstimateMinutes: number | null;
}

// ─── Medical Resources ──────────────────────────────────────────────────────

export interface MedicalStation {
  id: string;
  locationReference: string;
  displayLocation: string;
}

export interface MedicalResources {
  availableMedics: number;
  totalMedics: number;
  availableAmbulances: number;
  totalAmbulances: number;
  stations: MedicalStation[];
  /**
   * Derived automatically from the incidents array — count of incidents
   * with type "medical" and status !== "resolved".
   * NEVER manually set this field; the Context Engine recomputes it on
   * every state update.
   */
  activeMedicalIncidents: number;
}

// ─── Volunteers ─────────────────────────────────────────────────────────────

export type VolunteerStatus = 'available' | 'assigned' | 'on-break' | 'off-duty';

export interface Volunteer {
  id: string;
  displayName: string;
  assignedZone: string;
  status: VolunteerStatus;
  currentTask: string;
}

// ─── Incidents ───────────────────────────────────────────────────────────────

export type IncidentType =
  'crowd-surge' | 'medical' | 'lost-child' | 'equipment-failure' | 'weather-related' | 'security';

export type IncidentSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'monitoring' | 'resolved';

export interface Incident {
  id: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  /** Reference to a gate id or zone name. */
  locationReference: string;
  displayLocation: string;
  /** ISO 8601 timestamp of when the incident was reported. */
  reportedAt: string;
  status: IncidentStatus;
  description: string;
}

// ─── Match Info ──────────────────────────────────────────────────────────────

/**
 * A single entry in a team's simplified lineup.
 * Only a representative subset (5–6 players) is included, not a full 11-player
 * squad. Names are entirely fictional — no real footballers are referenced.
 */
export interface PlayerEntry {
  name: string;
  position: string;
}

/**
 * A notable match event (goal, card, substitution, etc.) logged so far.
 * Used to populate the "Recent Events" timeline on the Fan and Operations portals.
 */
export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow-card' | 'red-card' | 'substitution' | 'var-review';
  description: string;
}

/**
 * Live (simulated) match state.
 *
 * IMPORTANT — Static baseline semantics:
 *   matchMinute and scores are static per-session baseline values set in
 *   stadium-state.json — they do NOT auto-tick in real time. However, each
 *   scenario mutation nudges matchMinute forward slightly (+2 to +5 minutes)
 *   to make a demo session feel like the match is progressing as events occur.
 *   Clamp: matchMinute is clamped to [0, MAX_MATCH_MINUTE] in validator.ts and
 *   in each scenario mutation (see scenarios.ts).
 */
export interface MatchInfo {
  homeScore: number;
  awayScore: number;
  /** Elapsed match time in minutes. Nudged forward by scenario mutations for demo realism. */
  matchMinute: number;
  homeLineup: PlayerEntry[];
  awayLineup: PlayerEntry[];
  recentEvents: MatchEvent[];
}

// ─── Amenities ───────────────────────────────────────────────────────────────

/**
 * Category of an amenity stand.
 *
 * NOTE — Restrooms are intentionally excluded here. Accessible restrooms
 * are already modelled as AccessibilityAsset (assetType "accessible-restroom")
 * so that accessibility-specific logic (wait estimates, out-of-service alerts)
 * is handled by the accessibility pipeline. Duplicating them under amenities
 * would create two sources of truth for the same physical asset.
 */
export type AmenityType = 'food' | 'beverage' | 'merchandise';

export type AmenityStatus = 'open' | 'busy' | 'closed';

export interface Amenity {
  id: string;
  name: string;
  type: AmenityType;
  status: AmenityStatus;
  /** Gate or zone this stand is adjacent to (matches gate id convention, e.g. "gate-a"). */
  locationReference: string;
  /** Human-readable location label, e.g. "Gate A — North Concourse". */
  displayLocation: string;
  /** Short description of the stand's offering. Optional for conciseness. */
  description?: string;
}

// ─── Top-level Stadium Context ───────────────────────────────────────────────

/**
 * StadiumContext — the single, canonical "Digital Stadium Twin" shape.
 * This is the ONE source of truth that every module in ArenaMind reads from.
 */
export interface StadiumContext {
  metadata: StadiumMetadata;
  gates: Gate[];
  weather: Weather;
  transport: Transport;
  accessibilityAssets: AccessibilityAsset[];
  medicalResources: MedicalResources;
  volunteers: Volunteer[];
  incidents: Incident[];
  /** Phase 4C-1: Live (simulated) match state — score, clock, lineups, and recent events. */
  matchInfo: MatchInfo;
  /** Phase 4C-1: Food, beverage, and merchandise concession stands distributed around the venue. */
  amenities: Amenity[];
}
