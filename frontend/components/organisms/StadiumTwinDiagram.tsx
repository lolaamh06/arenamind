'use client';

/**
 * StadiumTwinDiagram — Phase 5B Visual Illustration Rebuild
 *
 * RESEARCH SUMMARY:
 * References studied before rebuilding:
 *
 * 1. Broadcast pre-match stadium graphics (Sky Sports, ESPN, UEFA Final overlays)
 *    → Turf: alternating mown-stripe bands (light/dark opacity rows), NOT flat green.
 *    → Markings: rgba(255,255,255,0.55–0.70) — not pure white. Gives realism.
 *    → Pitch edges: soft inner vignette/shadow so pitch recedes under stands.
 *    → Scene: a "floodlit pitch" ambient — soft radial glow centered on the pitch,
 *      simulating arena lighting effects.
 *
 * 2. Ticketing platform seating maps (Ticketmaster, StubHub, SeatGeek SVG maps)
 *    → Seating bowl: 3–4 graduated concentric bands stepping from dark outer structural
 *      ring to lighter inner tier colors, giving the impression of depth/tiers.
 *    → Fine "seat row" lines: thin arcs within each band, repeating every ~8px,
 *      suggesting thousands of individual rows without drawing them individually.
 *    → Gate markers: small "stem" connecting marker to bowl edge — reads as a physical
 *      entrance/opening, not a floating UI dot. Markers have a drop-shadow/base.
 *
 * 3. Premium dashboard "facility twin" visualizations (Autodesk Tandem, IBM Maximo)
 *    → Structural corner elements for floodlight towers.
 *    → Canopy ring/shadow suggests roof structure without full 3D rendering.
 *    → Overall scene sits on a deep dark base with subtle grid/vignette.
 *
 * DIRECTION CHOSEN: Top-down (not isometric — preserves gate coordinate system).
 *   - Pitch: mown-stripe gradient fills + full correct markings
 *   - Bowl: 3-band graduated fills + fine radial row-line texture
 *   - Structural: 4 floodlight towers + canopy shadow ring
 *   - Gate markers: stem tab + SVG filter glow for critical/high states
 *   - Weather: CSS-animateTransform rain-lines (SVG-native, off React cycle)
 *   - Scene: ambient radial glow behind pitch + corner vignette
 *
 * PROPS INTERFACE: Unchanged from 4C-3/4C-4 — all calling code works as-is.
 * ACCESSIBILITY: All ARIA labels, keyboard nav, tabIndex unchanged.
 * INTERACTIVITY: All click handlers, hover state, selectedGateId unchanged.
 */

import React, { useState } from 'react';
import { StadiumContext, RiskLevel } from '../../types';
import { Badge } from '../atoms/Badge';
import { IconWrapper } from '../atoms/IconWrapper';
import { Cloud, Sun, CloudRain, CloudLightning } from 'lucide-react';
import { translateGateRisk } from '../../lib/fan-language';

export interface StadiumTwinDiagramProps {
  stadiumContext: StadiumContext | null;
  onGateClick?: (gateId: string) => void;
  selectedGateId?: string | null;
  variant?: 'detailed' | 'simple';
}

export const StadiumTwinDiagram: React.FC<StadiumTwinDiagramProps> = ({
  stadiumContext,
  onGateClick,
  selectedGateId,
  variant = 'detailed',
}) => {
  const [hoveredGateId, setHoveredGateId] = useState<string | null>(null);

  if (!stadiumContext) {
    return (
      <div className="h-96 rounded-large border border-[rgba(255,255,255,0.07)] bg-bg-card/20 flex items-center justify-center text-text-muted text-xs">
        No stadium context loaded for visualization.
      </div>
    );
  }

  const { gates = [], weather } = stadiumContext;
  const isSimple = variant === 'simple';

  // ─── Gate positions — unchanged from 4C-3 ─────────────────────────────────────
  const gateCoordinates: Record<string, { x: number; y: number; label: string; name: string }> = {
    'gate-a': { x: 250, y: 48,  label: 'A', name: 'North Stand' },
    'gate-b': { x: 392, y: 88,  label: 'B', name: 'North-East' },
    'gate-c': { x: 448, y: 200, label: 'C', name: 'East Stand' },
    'gate-d': { x: 392, y: 312, label: 'D', name: 'South-East' },
    'gate-e': { x: 250, y: 352, label: 'E', name: 'South Stand' },
    'gate-f': { x: 108, y: 312, label: 'F', name: 'South-West' },
    'gate-g': { x: 52,  y: 200, label: 'G', name: 'West Stand' },
    'gate-h': { x: 108, y: 88,  label: 'H', name: 'North-West' },
  };

  // ─── Risk color palettes ───────────────────────────────────────────────────────
  // Detailed (Operations): clinical indigo/amber/orange/red — Phase 5A tokens
  const detailedRiskColors: Record<RiskLevel, { stroke: string; fill: string; glowColor: string; text: string; filterId: string }> = {
    low:      { stroke: '#52526a', fill: '#16162a', glowColor: 'rgba(82,82,106,0)',  text: '#9090a8', filterId: 'glow-low-d'      },
    moderate: { stroke: '#818cf8', fill: '#312e81', glowColor: 'rgba(129,140,248,0.7)', text: '#c7d2fe', filterId: 'glow-mod-d'      },
    high:     { stroke: '#fbbf24', fill: '#78350f', glowColor: 'rgba(251,191,36,0.9)', text: '#fde68a', filterId: 'glow-high-d'     },
    critical: { stroke: '#f87171', fill: '#450a0a', glowColor: 'rgba(248,113,113,1.0)', text: '#fecaca', filterId: 'glow-crit-d' },
  };

  // Simple (Fan): warmer palette, critical softened to amber, same structure
  const simpleRiskColors: Record<RiskLevel, { stroke: string; fill: string; glowColor: string; text: string; filterId: string }> = {
    low:      { stroke: '#34d399', fill: '#022c22', glowColor: 'rgba(52,211,153,0)',   text: '#6ee7b7', filterId: 'glow-low-s'      },
    moderate: { stroke: '#60a5fa', fill: '#1e3a8a', glowColor: 'rgba(96,165,250,0.6)', text: '#bfdbfe', filterId: 'glow-mod-s'      },
    high:     { stroke: '#fbbf24', fill: '#78350f', glowColor: 'rgba(251,191,36,0.8)', text: '#fde68a', filterId: 'glow-high-s'     },
    critical: { stroke: '#fbbf24', fill: '#78350f', glowColor: 'rgba(251,191,36,0.9)', text: '#fde68a', filterId: 'glow-crit-s' }, // softened
  };

  const riskColors = isSimple ? simpleRiskColors : detailedRiskColors;

  // ─── Weather icon ──────────────────────────────────────────────────────────────
  const getWeatherIcon = (cond?: string) => {
    switch (cond) {
      case 'clear':       return Sun;
      case 'cloudy':      return Cloud;
      case 'light-rain':
      case 'heavy-rain':  return CloudRain;
      case 'storm':       return CloudLightning;
      default:            return Cloud;
    }
  };
  const WeatherIcon = getWeatherIcon(weather?.condition);
  const isRaining = weather?.condition === 'light-rain' || weather?.condition === 'heavy-rain' || weather?.condition === 'storm';
  const isCloudy  = weather?.condition === 'cloudy';

  // ─── Colour scheme for the illustration layers ────────────────────────────────
  // All tones use the midnight blue-black base from Phase 5A
  const c = {
    outerWall:   '#0d0d1a',   // darker than bg-base — the outer structural concrete
    tier3:       '#12122a',   // outermost seating band (upper deck)
    tier2:       '#1a1a3a',   // middle seating band
    tier1:       '#1e1e42',   // inner seating band (closest to pitch)
    tierLine:    'rgba(255,255,255,0.04)',   // individual "seat row" lines
    canopy:      '#0a0a16',   // roof/canopy shadow ring
    canopyEdge:  'rgba(255,255,255,0.06)',  // canopy edge highlight
    pitchBase:   '#0d3320',   // deep green for pitch base
    pitchLight:  '#0f4428',   // lighter mown stripe tone
    pitchDark:   '#0b2e1c',   // darker mown stripe tone
    pitchMark:   'rgba(255,255,255,0.60)',  // pitch markings — not pure white
    pitchMarkFaint: 'rgba(255,255,255,0.30)', // secondary markings
    stemColor:   'rgba(255,255,255,0.12)',  // gate stem connecting to bowl
    tower:       '#1c1c3a',   // floodlight tower body
    towerLight:  '#fbbf24',   // floodlight warm glow
  };

  // In simple/fan mode, slightly warmer tones
  if (isSimple) {
    c.tier3 = '#111128';
    c.tier2 = '#17172e';
    c.tier1 = '#1c1c36';
    c.pitchBase  = '#0e3822';
    c.pitchLight = '#115430';
  }

  return (
    <div
      className={[
        'relative w-full overflow-hidden select-none transition-all duration-medium',
        isSimple
          ? 'border border-[rgba(255,255,255,0.07)] bg-bg-card p-4 rounded-large shadow-[var(--shadow-low)]'
          : 'border border-[rgba(255,255,255,0.07)] bg-bg-base p-6 rounded-2xl shadow-[var(--shadow-high)]',
      ].join(' ')}
    >
      {/* ── Scene ambient vignette (very subtle dark corners, gives depth) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(8,8,14,0.7) 100%)',
        }}
      />

      {/* ── Weather ambient overlay ── */}
      {isCloudy && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(80,80,120,0.12) 0%, transparent 65%)',
          }}
        />
      )}

      {/* ── Weather corner badge ── */}
      {weather && (
        <div
          className={[
            'absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full',
            'text-[10px] font-medium font-sans tracking-wide',
            'backdrop-blur-md border',
            isSimple
              ? 'border-[rgba(255,255,255,0.10)] bg-bg-secondary/80 text-text-secondary'
              : 'border-[rgba(255,255,255,0.08)] bg-[rgba(14,14,23,0.80)] text-[#9090a8]',
          ].join(' ')}
        >
          <IconWrapper icon={WeatherIcon} size="sm" className="text-primary-400 shrink-0" />
          <span className="capitalize">{weather.condition.replace(/-/g, ' ')}</span>
        </div>
      )}

      {/* ── Title ── */}
      <div className="absolute top-4 left-5 z-20">
        <span
          className={[
            'text-[9px] font-mono tracking-[0.18em] uppercase block',
            isSimple ? 'text-primary-400' : 'text-[#52526a]',
          ].join(' ')}
        >
          {isSimple ? 'Stadium Map' : 'Twin Visualizer'}
        </span>
        <h3
          className={[
            'text-xs font-bold mt-0.5',
            isSimple ? 'text-text-primary' : 'text-[#9090a8]',
          ].join(' ')}
        >
          {isSimple ? 'Select Your Entry Gate' : 'Interactive Spatial Map'}
        </h3>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          SVG DIAGRAM — 500×400 viewbox
          Layout:
            Outer structural perimeter:  rx=130 stadium oval
            Canopy shadow ring:          slightly inset, very dark
            3 seating tier bands:        each with fine row-line texture
            Floodlight towers:           4 corners, structural tabs
            Pitch:                       mown-stripe gradient, full markings
            Gate markers:                stem + SVG-filter glow + label
            Rain overlay:                CSS-animated SVG lines (if raining)
      ════════════════════════════════════════════════════════════════ */}
      <svg
        viewBox="0 0 500 400"
        className="w-full h-auto max-h-[380px] mx-auto mt-7 relative z-10"
        aria-label="Stadium aerial view diagram showing all entry gates"
        role="img"
      >
        <defs>
          {/* ── CSS Animations (SVG-native — run outside React cycle) ── */}
          <style>{`
            @keyframes pulseRing {
              0%   { r: 0;  opacity: 0.8; }
              70%  { r: 14; opacity: 0;   }
              100% { r: 14; opacity: 0;   }
            }
            @keyframes pulseRingLg {
              0%   { r: 0;  opacity: 0.8; }
              70%  { r: 18; opacity: 0;   }
              100% { r: 18; opacity: 0;   }
            }
            .pulse-ring {
              transform-box: fill-box;
              transform-origin: center;
              animation: pulseRing 2.2s cubic-bezier(0.2,0,0.8,1) infinite;
            }
            .pulse-ring-lg {
              transform-box: fill-box;
              transform-origin: center;
              animation: pulseRingLg 2.2s cubic-bezier(0.2,0,0.8,1) infinite;
            }
            .pulse-ring-delay {
              animation-delay: 1.1s;
            }
            @keyframes rainFall {
              0%   { transform: translateY(-40px) translateX(0px);  opacity: 0.6; }
              100% { transform: translateY(440px) translateX(-80px); opacity: 0.2; }
            }
            .rain-line { animation: rainFall 1.4s linear infinite; }
            .rain-line:nth-child(2) { animation-delay: -0.2s; }
            .rain-line:nth-child(3) { animation-delay: -0.5s; }
            .rain-line:nth-child(4) { animation-delay: -0.7s; }
            .rain-line:nth-child(5) { animation-delay: -1.0s; }
            .rain-line:nth-child(6) { animation-delay: -0.3s; }
            .rain-line:nth-child(7) { animation-delay: -0.9s; }
            .rain-line:nth-child(8) { animation-delay: -0.15s; }

            @keyframes towerPulse {
              0%, 100% { opacity: 0.8; }
              50%       { opacity: 1.0; }
            }
            .tower-light { animation: towerPulse 3s ease-in-out infinite; }
          `}</style>

          {/* ── SVG Filter glows for gate markers ── */}
          {/* moderate glow */}
          <filter id="glow-mod-d" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#818cf8" floodOpacity="0.7" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="colorBlur" />
            <feMerge><feMergeNode in="colorBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-mod-s" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#60a5fa" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="colorBlur" />
            <feMerge><feMergeNode in="colorBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* high glow */}
          <filter id="glow-high-d" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feFlood floodColor="#fbbf24" floodOpacity="0.85" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="colorBlur" />
            <feMerge><feMergeNode in="colorBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-high-s" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#fbbf24" floodOpacity="0.75" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="colorBlur" />
            <feMerge><feMergeNode in="colorBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* critical glow — strongest */}
          <filter id="glow-crit-d" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5.5" result="blur" />
            <feFlood floodColor="#f87171" floodOpacity="1.0" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="colorBlur" />
            <feMerge><feMergeNode in="colorBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-crit-s" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feFlood floodColor="#fbbf24" floodOpacity="0.9" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="colorBlur" />
            <feMerge><feMergeNode in="colorBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* no-glow placeholder for low risk */}
          <filter id="glow-low-d" /><filter id="glow-low-s" />

          {/* ── Pitch ambient glow (radial, behind pitch, scene lighting) ── */}
          <radialGradient id="pitchAmbient" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1a5c35" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0d3320" stopOpacity="0" />
          </radialGradient>

          {/* ── Mown stripe pattern (alternating opacity bands) ── */}
          <pattern id="mownStripes" x="0" y="0" width="10" height="80" patternUnits="userSpaceOnUse">
            <rect x="0" y="0"  width="10" height="80" fill="#0f4428" />
            <rect x="0" y="0"  width="10" height="10" fill="#0d3c24" />
            <rect x="0" y="20" width="10" height="10" fill="#0d3c24" />
            <rect x="0" y="40" width="10" height="10" fill="#0d3c24" />
            <rect x="0" y="60" width="10" height="10" fill="#0d3c24" />
          </pattern>

          {/* ── Seating row-line texture (fine radial lines within tiers) ── */}
          <pattern id="seatRows" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="8" y2="0" stroke="rgba(255,255,255,0.035)" strokeWidth="0.5" />
          </pattern>

          {/* ── Pitch edge shadow (inner vignette) ── */}
          <radialGradient id="pitchEdgeShadow" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="rgba(0,0,0,0)"     />
            <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
          </radialGradient>

          {/* ── Scene background gradient ── */}
          <radialGradient id="sceneBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#0e0e1a" />
            <stop offset="100%" stopColor="#08080e" />
          </radialGradient>

          {/* ── Canopy gradient (dark ring with subtle edge highlight) ── */}
          <radialGradient id="canopyGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#10101e" stopOpacity="0" />
            <stop offset="80%"  stopColor="#10101e" stopOpacity="0" />
            <stop offset="90%"  stopColor="#0a0a16" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0a0a16" stopOpacity="1" />
          </radialGradient>

          {/* ── Outer structural ring gradient ── */}
          <radialGradient id="outerWallGrad" cx="50%" cy="35%" r="55%">
            <stop offset="0%"  stopColor="#1a1a3a" />
            <stop offset="100%" stopColor="#0a0a16" />
          </radialGradient>
        </defs>

        {/* ════════════════════════════════════════
            LAYER 0: Scene background
        ════════════════════════════════════════ */}
        <rect x="0" y="0" width="500" height="400" fill="url(#sceneBg)" />

        {/* Soft ambient glow behind the pitch center */}
        <ellipse cx="250" cy="200" rx="120" ry="80" fill="rgba(20,80,45,0.25)" />

        {/* ════════════════════════════════════════
            LAYER 1: Outer structural perimeter
            The outermost architectural boundary —
            the stadium's concrete/structural wall
        ════════════════════════════════════════ */}
        <ellipse
          cx="250" cy="200"
          rx="195" ry="165"
          fill="url(#outerWallGrad)"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />

        {/* ════════════════════════════════════════
            LAYER 2: Seating tier bands
            3 concentric bands stepping inward,
            each slightly lighter and with seat-row
            texture overlay suggesting real rows.
        ════════════════════════════════════════ */}

        {/* Tier 3 — upper deck (outermost band) */}
        <ellipse
          cx="250" cy="200"
          rx="175" ry="148"
          fill={c.tier3}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.5"
        />
        {/* Seat-row texture overlay — upper deck */}
        <ellipse
          cx="250" cy="200"
          rx="175" ry="148"
          fill="url(#seatRows)"
          opacity="0.8"
        />

        {/* Tier 2 — mid deck */}
        <ellipse
          cx="250" cy="200"
          rx="150" ry="126"
          fill={c.tier2}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
        {/* Seat-row texture overlay — mid deck */}
        <ellipse
          cx="250" cy="200"
          rx="150" ry="126"
          fill="url(#seatRows)"
          opacity="0.7"
        />

        {/* Tier 1 — lower deck (inner, closest to pitch) */}
        <ellipse
          cx="250" cy="200"
          rx="124" ry="104"
          fill={c.tier1}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.5"
        />
        {/* Seat-row texture overlay — lower deck */}
        <ellipse
          cx="250" cy="200"
          rx="124" ry="104"
          fill="url(#seatRows)"
          opacity="0.6"
        />

        {/* Canopy shadow ring — implies a roof overhanging the upper tier */}
        <ellipse
          cx="250" cy="200"
          rx="190" ry="160"
          fill="none"
          stroke={c.canopyEdge}
          strokeWidth="6"
          opacity="0.5"
        />
        {/* Canopy inner shadow */}
        <ellipse
          cx="250" cy="200"
          rx="183" ry="153"
          fill="none"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="3"
        />

        {/* ════════════════════════════════════════
            LAYER 3: Floodlight tower structures
            4 corner positions around the bowl.
            Small structural shapes that read as
            architectural elements, not UI controls.
        ════════════════════════════════════════ */}
        {[
          { cx: 90,  cy: 85  },  // NW
          { cx: 410, cy: 85  },  // NE
          { cx: 410, cy: 315 },  // SE
          { cx: 90,  cy: 315 },  // SW
        ].map((tower, i) => (
          <g key={`tower-${i}`} aria-hidden="true">
            {/* Tower base — small structural square */}
            <rect
              x={tower.cx - 6}
              y={tower.cy - 6}
              width="12"
              height="12"
              rx="2"
              fill={c.tower}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.75"
            />
            {/* Tower arm — diagonal bar reaching to edge */}
            <line
              x1={tower.cx}
              y1={tower.cy}
              x2={250}
              y2={200}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.5"
            />
            {/* Floodlight cluster — 4 tiny warm-white dots */}
            {[-3, 0, 3].map((dx) => (
              <circle
                key={dx}
                cx={tower.cx + dx}
                cy={tower.cy - 8}
                r="1.5"
                fill={c.towerLight}
                className="tower-light"
                opacity="0.8"
              />
            ))}
            {/* Warm glow halo around floodlights */}
            <circle
              cx={tower.cx}
              cy={tower.cy - 8}
              r="6"
              fill="rgba(251,191,36,0.08)"
            />
          </g>
        ))}

        {/* ════════════════════════════════════════
            LAYER 4: Central football pitch
            Mown-stripe texture via pattern fill.
            Full correct markings.
            Inner vignette/shadow at edges.
        ════════════════════════════════════════ */}
        <g id="football-pitch" aria-hidden="true">
          {/* Pitch ambient glow behind it */}
          <ellipse cx="250" cy="200" rx="90" ry="58" fill="url(#pitchAmbient)" />

          {/* Pitch base — mown-stripe fill */}
          <rect
            x="158" y="152"
            width="184" height="96"
            rx="3"
            fill="url(#mownStripes)"
          />

          {/* Pitch outer shadow/vignette — recedes it under the stands */}
          <rect
            x="158" y="152"
            width="184" height="96"
            rx="3"
            fill="url(#pitchEdgeShadow)"
          />

          {/* Pitch border line */}
          <rect
            x="158" y="152"
            width="184" height="96"
            rx="3"
            fill="none"
            stroke={c.pitchMark}
            strokeWidth="1"
          />

          {/* Halfway line */}
          <line
            x1="250" y1="152"
            x2="250" y2="248"
            stroke={c.pitchMark}
            strokeWidth="0.8"
          />

          {/* Center circle */}
          <circle
            cx="250" cy="200"
            r="20"
            fill="none"
            stroke={c.pitchMark}
            strokeWidth="0.8"
          />

          {/* Center spot */}
          <circle cx="250" cy="200" r="1.5" fill={c.pitchMark} />

          {/* Left penalty box */}
          <rect
            x="158" y="172"
            width="28" height="56"
            fill="none"
            stroke={c.pitchMark}
            strokeWidth="0.8"
          />

          {/* Left goal area (6-yard box) */}
          <rect
            x="158" y="184"
            width="12" height="32"
            fill="none"
            stroke={c.pitchMarkFaint}
            strokeWidth="0.7"
          />

          {/* Left goal (behind line) */}
          <rect
            x="152" y="188"
            width="6" height="24"
            fill="rgba(255,255,255,0.06)"
            stroke={c.pitchMarkFaint}
            strokeWidth="0.5"
          />

          {/* Left penalty spot */}
          <circle cx="176" cy="200" r="1" fill={c.pitchMarkFaint} />

          {/* Left penalty arc */}
          <path
            d="M 186,185 A 16,16 0 0 1 186,215"
            fill="none"
            stroke={c.pitchMarkFaint}
            strokeWidth="0.7"
          />

          {/* Right penalty box */}
          <rect
            x="314" y="172"
            width="28" height="56"
            fill="none"
            stroke={c.pitchMark}
            strokeWidth="0.8"
          />

          {/* Right goal area (6-yard box) */}
          <rect
            x="330" y="184"
            width="12" height="32"
            fill="none"
            stroke={c.pitchMarkFaint}
            strokeWidth="0.7"
          />

          {/* Right goal (behind line) */}
          <rect
            x="342" y="188"
            width="6" height="24"
            fill="rgba(255,255,255,0.06)"
            stroke={c.pitchMarkFaint}
            strokeWidth="0.5"
          />

          {/* Right penalty spot */}
          <circle cx="324" cy="200" r="1" fill={c.pitchMarkFaint} />

          {/* Right penalty arc */}
          <path
            d="M 314,185 A 16,16 0 0 0 314,215"
            fill="none"
            stroke={c.pitchMarkFaint}
            strokeWidth="0.7"
          />

          {/* Corner arcs */}
          <path d="M 158,156 A 4,4 0 0 1 162,152" fill="none" stroke={c.pitchMarkFaint} strokeWidth="0.7" />
          <path d="M 338,152 A 4,4 0 0 1 342,156" fill="none" stroke={c.pitchMarkFaint} strokeWidth="0.7" />
          <path d="M 342,244 A 4,4 0 0 1 338,248" fill="none" stroke={c.pitchMarkFaint} strokeWidth="0.7" />
          <path d="M 162,248 A 4,4 0 0 1 158,244" fill="none" stroke={c.pitchMarkFaint} strokeWidth="0.7" />
        </g>

        {/* ════════════════════════════════════════
            LAYER 5: Rain overlay (weather ambient)
            CSS-animated SVG lines — runs outside
            React render cycle, no jank on rerender.
            Only rendered when raining/storming.
        ════════════════════════════════════════ */}
        {isRaining && (
          <g aria-hidden="true" opacity="0.35" clipPath="">
            {[60, 130, 200, 270, 340, 410, 90, 180, 270, 360].map((x, i) => (
              <line
                key={`rain-${i}`}
                x1={x}
                y1="-20"
                x2={x - 25}
                y2="50"
                stroke="rgba(147,197,253,0.6)"
                strokeWidth="0.75"
                className={`rain-line`}
                style={{ animationDelay: `${-i * 0.15}s` }}
              />
            ))}
          </g>
        )}

        {/* ════════════════════════════════════════
            LAYER 6: Gate markers
            Each gate gets:
            - A "stem" line from the bowl edge,
              implying a physical gate/opening
            - An SVG-filter glow for high/critical
            - The pulse ring animation for alerts
            - Large invisible touch target (mobile)
            - Full keyboard/ARIA accessibility
        ════════════════════════════════════════ */}
        {gates.map((g) => {
          const coord = gateCoordinates[g.id];
          if (!coord) return null;

          const colors      = riskColors[g.riskLevel] || riskColors.low;
          const isSelected  = selectedGateId === g.id;
          const isHovered   = hoveredGateId === g.id;
          const needsPulse  = g.riskLevel === 'critical' || g.riskLevel === 'high';
          const needsGlow   = g.riskLevel === 'critical' || g.riskLevel === 'high' || g.riskLevel === 'moderate';

          // Core radius — simple gets larger touch targets (unchanged from 4C-4)
          const coreR = isSimple
            ? (isSelected || isHovered ? 20 : 17)
            : (isSelected || isHovered ? 15 : 13);

          // Stem direction: from the gate outward away from center (250,200)
          const dx   = coord.x - 250;
          const dy   = coord.y - 200;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const nx   = dx / dist;  // unit normal pointing outward
          const ny   = dy / dist;

          // Inner end of stem (at bowl surface ~radius 130 from center)
          const stemLen = 12;
          const stemInnerX = coord.x - nx * stemLen;
          const stemInnerY = coord.y - ny * stemLen;

          return (
            <g
              key={g.id}
              tabIndex={0}
              className="cursor-pointer focus:outline-none"
              onClick={() => onGateClick?.(g.id)}
              onMouseEnter={() => setHoveredGateId(g.id)}
              onMouseLeave={() => setHoveredGateId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onGateClick?.(g.id);
                }
              }}
              aria-label={`Gate ${coord.label}: ${g.displayName}. ${translateGateRisk(g.riskLevel)}`}
            >
              {/* ── Invisible large touch target (mobile accessibility) ── */}
              <circle cx={coord.x} cy={coord.y} r="28" fill="transparent" />

              {/* ── Structural stem — connects marker to bowl edge ── */}
              <line
                x1={stemInnerX}
                y1={stemInnerY}
                x2={coord.x}
                y2={coord.y}
                stroke={isSelected ? colors.stroke : c.stemColor}
                strokeWidth={isSelected ? 1.5 : 1}
                strokeDasharray={isSelected ? 'none' : '3,2'}
              />

              {/* ── Pulse rings for alert states ── */}
              {needsPulse && (
                <>
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="0"
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="1.5"
                    className={isSimple ? 'pulse-ring-lg' : 'pulse-ring'}
                    style={{ animationDelay: '0s' }}
                  />
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="0"
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="1"
                    opacity="0.5"
                    className={isSimple ? 'pulse-ring-lg' : 'pulse-ring'}
                    style={{ animationDelay: '-1.1s' }}
                  />
                </>
              )}

              {/* ── Selection ring (when selected) ── */}
              {isSelected && (
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={coreR + 5}
                  fill="none"
                  stroke={isSimple ? '#fbbf24' : '#818cf8'}
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                  opacity="0.7"
                />
              )}

              {/* ── Core marker (with SVG filter glow for high/critical) ── */}
              <circle
                cx={coord.x}
                cy={coord.y}
                r={coreR}
                fill={colors.fill}
                stroke={isSelected ? (isSimple ? '#fbbf24' : '#818cf8') : colors.stroke}
                strokeWidth={isSelected ? 2.5 : 2}
                filter={needsGlow ? `url(#${colors.filterId})` : undefined}
              />

              {/* ── Inner highlight dot (premium depth touch) ── */}
              <circle
                cx={coord.x - coreR * 0.25}
                cy={coord.y - coreR * 0.3}
                r={coreR * 0.22}
                fill="rgba(255,255,255,0.12)"
              />

              {/* ── Gate letter label ── */}
              <text
                x={coord.x}
                y={coord.y + (isSimple ? 5 : 4)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isSimple ? '12' : '10'}
                fontWeight="700"
                fill={colors.text}
                fontFamily="'JetBrains Mono', 'Fira Code', monospace"
              >
                {coord.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ════════════════════════════════════════
          INFO PANEL — unchanged from 4C-3/4C-4
          All tooltip/detail content, gate status
          and data display — functionally identical.
      ════════════════════════════════════════ */}
      <div
        className={[
          'mt-4 p-4 rounded-large border backdrop-blur-sm min-h-[64px] flex items-center justify-between text-xs transition-all duration-fast',
          isSimple
            ? 'border-[rgba(255,255,255,0.07)] bg-bg-secondary text-text-secondary'
            : 'border-[rgba(255,255,255,0.08)] bg-[rgba(14,14,23,0.60)] text-[#9090a8]',
        ].join(' ')}
      >
        {hoveredGateId || selectedGateId ? (
          (() => {
            const activeId = hoveredGateId || selectedGateId;
            const g = gates.find((gate) => gate.id === activeId);
            const coord = g ? gateCoordinates[g.id] : null;
            if (!g || !coord) return <span>Select a gate point to inspect…</span>;

            const isCritical = g.riskLevel === 'critical';
            const isHigh     = g.riskLevel === 'high';

            if (isSimple) {
              return (
                <div className="w-full flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary font-sans">Gate {coord.label}</span>
                      <span className="text-text-muted text-[10px] font-sans">({coord.name})</span>
                    </div>
                    <p className="text-[11px] font-semibold text-text-primary font-sans leading-tight">
                      {translateGateRisk(g.riskLevel)}
                    </p>
                  </div>
                  <Badge variant={isCritical || isHigh ? 'warning' : 'neutral'}>
                    Selected
                  </Badge>
                </div>
              );
            }

            return (
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-text-primary">Gate {coord.label}</span>
                    <span className="text-text-muted font-mono text-[10px]">({coord.name})</span>
                    <Badge variant={isCritical || isHigh ? 'critical' : g.riskLevel === 'moderate' ? 'warning' : 'neutral'}>
                      {g.riskLevel}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-text-muted flex flex-wrap gap-x-3 gap-y-1 font-mono">
                    <span>Queue: <strong className="text-text-secondary">{g.queueEstimate.toLocaleString()}</strong></span>
                    <span>Occupancy: <strong className="text-text-secondary">{g.occupancyPercent}%</strong></span>
                    <span className="capitalize">Trend: <strong className="text-text-secondary">{g.trend}</strong></span>
                  </div>
                </div>
                <div className="text-[10px] text-text-muted font-sans italic bg-[rgba(255,255,255,0.04)] px-3 py-1.5 rounded-xl border border-[rgba(255,255,255,0.07)]">
                  Click marker to dispatch query brief
                </div>
              </div>
            );
          })()
        ) : (
          <div className="flex items-center gap-2 text-text-muted font-sans">
            <span className="h-1.5 w-1.5 rounded-full bg-[rgba(255,255,255,0.20)] animate-pulse shrink-0" />
            <span>
              {isSimple
                ? 'Tap any gate marker to set your entry gate.'
                : 'Hover or click any gate marker to inspect live data.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
