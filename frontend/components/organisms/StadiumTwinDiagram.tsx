/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { StadiumContext, RiskLevel, Gate } from '../../types';
import { Badge } from '../atoms/Badge';
import { IconWrapper } from '../atoms/IconWrapper';
import { Cloud, Sun, CloudRain, CloudLightning, RefreshCw } from 'lucide-react';
import { translateGateRisk } from '../../lib/fan-language';
import dynamic from 'next/dynamic';

// Dynamic imports of React Three Fiber components to prevent SSR / WebGL loading issues
const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { ssr: false }
);

const OrbitControls = dynamic(
  () => import('@react-three/drei').then((mod) => mod.OrbitControls),
  { ssr: false }
);

const Html = dynamic(
  () => import('@react-three/drei').then((mod) => mod.Html),
  { ssr: false }
);

// ─── WebGL Availability Check ───────────────────────────────────────────────
function isWebGLAvailable() {
  try {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// ─── Gate Metadata & Layout mapping in 3D ──────────────────────────────────
// Placed at outer perimeter pathway gaps
const gate3DPositions: Record<string, { x: number; y: number; z: number; label: string; name: string }> = {
  'gate-a': { x: 0,      y: 0.1, z: -5.6,  label: 'A', name: 'North Stand' },
  'gate-b': { x: 4.0,    y: 0.1, z: -4.0,  label: 'B', name: 'North-East' },
  'gate-c': { x: 5.6,    y: 0.1, z: 0,     label: 'C', name: 'East Stand' },
  'gate-d': { x: 4.0,    y: 0.1, z: 4.0,   label: 'D', name: 'South-East' },
  'gate-e': { x: 0,      y: 0.1, z: 5.6,   label: 'E', name: 'South Stand' },
  'gate-f': { x: -4.0,   y: 0.1, z: 4.0,   label: 'F', name: 'South-West' },
  'gate-g': { x: -5.6,   y: 0.1, z: 0,     label: 'G', name: 'West Stand' },
  'gate-h': { x: -4.0,   y: 0.1, z: -4.0,  label: 'H', name: 'North-West' },
};

// ─── Gate Coordinates for 2D Fallback ────────────────────────────────────────
const gate2DCoordinates: Record<string, { x: number; y: number; label: string; name: string }> = {
  'gate-a': { x: 250, y: 48,  label: 'A', name: 'North Stand' },
  'gate-b': { x: 392, y: 88,  label: 'B', name: 'North-East' },
  'gate-c': { x: 448, y: 200, label: 'C', name: 'East Stand' },
  'gate-d': { x: 392, y: 312, label: 'D', name: 'South-East' },
  'gate-e': { x: 250, y: 352, label: 'E', name: 'South Stand' },
  'gate-f': { x: 108, y: 312, label: 'F', name: 'South-West' },
  'gate-g': { x: 52,  y: 200, label: 'G', name: 'West Stand' },
  'gate-h': { x: 108, y: 88,  label: 'H', name: 'North-West' },
};

// ─── Risk Color Maps ────────────────────────────────────────────────────────
const detailedRiskColors: Record<RiskLevel, { stroke: string; fill: string; glow: string; text: string; glowIntensity: number }> = {
  low:      { stroke: '#52526a', fill: '#16162a', glow: '#52526a', text: '#9090a8', glowIntensity: 0.0 },
  moderate: { stroke: '#818cf8', fill: '#312e81', glow: '#818cf8', text: '#c7d2fe', glowIntensity: 1.0 },
  high:     { stroke: '#fbbf24', fill: '#78350f', glow: '#fbbf24', text: '#fde68a', glowIntensity: 2.2 },
  critical: { stroke: '#f87171', fill: '#450a0a', glow: '#f87171', text: '#fecaca', glowIntensity: 3.5 },
};

const simpleRiskColors: Record<RiskLevel, { stroke: string; fill: string; glow: string; text: string; glowIntensity: number }> = {
  low:      { stroke: '#34d399', fill: '#022c22', glow: '#34d399', text: '#6ee7b7', glowIntensity: 0.0 },
  moderate: { stroke: '#60a5fa', fill: '#1e3a8a', glow: '#60a5fa', text: '#bfdbfe', glowIntensity: 1.0 },
  high:     { stroke: '#fbbf24', fill: '#78350f', glow: '#fbbf24', text: '#fde68a', glowIntensity: 2.0 },
  critical: { stroke: '#fbbf24', fill: '#78350f', glow: '#fbbf24', text: '#fde68a', glowIntensity: 2.5 },
};

export interface StadiumTwinDiagramProps {
  stadiumContext: StadiumContext | null;
  onGateClick?: (gateId: string) => void;
  selectedGateId?: string | null;
  variant?: 'detailed' | 'simple';
}

// ─── 3D PITCH CANVAS TEXTURE GENERATOR ───────────────────────────────────────
function createPitchCanvas(isSimple: boolean) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const bgBase  = isSimple ? '#0e3822' : '#0d3320';
  const bgLight = isSimple ? '#115430' : '#0f4428';
  const bgDark  = isSimple ? '#0b2e1c' : '#0b2e1c';
  const markColor = 'rgba(255,255,255,0.75)';

  ctx.fillStyle = bgBase;
  ctx.fillRect(0, 0, 512, 340);

  // Alternating stripes (16 light/dark rows)
  const numStripes = 16;
  const stripeWidth = 512 / numStripes;
  for (let i = 0; i < numStripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? bgLight : bgDark;
    ctx.fillRect(i * stripeWidth, 0, stripeWidth, 340);
  }

  // Draw boundary markings
  ctx.strokeStyle = markColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 492, 320);

  // Center Line
  ctx.beginPath();
  ctx.moveTo(256, 10);
  ctx.lineTo(256, 330);
  ctx.stroke();

  // Center Circle
  ctx.beginPath();
  ctx.arc(256, 170, 50, 0, 2 * Math.PI);
  ctx.stroke();

  // Center Dot
  ctx.fillStyle = markColor;
  ctx.beginPath();
  ctx.arc(256, 170, 4, 0, 2 * Math.PI);
  ctx.fill();

  // Penalty Areas (Left & Right)
  ctx.strokeRect(10, 75, 75, 190);
  ctx.strokeRect(427, 75, 75, 190);

  // Goal Areas
  ctx.strokeRect(10, 120, 25, 100);
  ctx.strokeRect(477, 120, 25, 100);

  // Corner arcs
  const rArc = 10;
  ctx.beginPath(); ctx.arc(10, 10, rArc, 0, 0.5 * Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.arc(10, 330, rArc, 1.5 * Math.PI, 2 * Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.arc(502, 10, rArc, 0.5 * Math.PI, Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.arc(502, 330, rArc, Math.PI, 1.5 * Math.PI); ctx.stroke();

  return canvas;
}

// ─── 3D STADIUM MODEL INTERNAL COMPONENT ─────────────────────────────────────
interface Stadium3DModelProps {
  gates: Gate[];
  weather: { condition: string; temperatureCelsius: number } | null | undefined;
  onGateClick?: (gateId: string) => void;
  selectedGateId?: string | null;
  variant: 'detailed' | 'simple';
  hoveredGateId: string | null;
  setHoveredGateId: (id: string | null) => void;
}

const Stadium3DModel: React.FC<Stadium3DModelProps> = ({
  gates,
  weather,
  onGateClick,
  selectedGateId,
  variant,
  hoveredGateId,
  setHoveredGateId
}) => {
  const isSimple = variant === 'simple';
  const riskColors = isSimple ? simpleRiskColors : detailedRiskColors;

  // Memoize canvas generation for pitch texture
  const pitchCanvas = useMemo(() => createPitchCanvas(isSimple), [isSimple]);

  // Seating Stand definitions flanking all sides of the pitch
  const stands: Array<{ pos: [number, number, number]; size: [number, number]; dir: 'h' | 'v'; color: string; seatColor: string }> = useMemo(() => [
    // North Stand (Blue seats)
    { pos: [0, 0, -4.2], size: [7.2, 1.0], dir: 'h', color: '#1e3a8a', seatColor: '#3b82f6' },
    // South Stand (Emerald seats)
    { pos: [0, 0, 4.2], size: [7.2, 1.0], dir: 'h', color: '#064e3b', seatColor: '#10b981' },
    // East Stand (Amber seats)
    { pos: [4.9, 0, 0], size: [1.0, 5.0], dir: 'v', color: '#78350f', seatColor: '#f59e0b' },
    // West Stand (Red seats)
    { pos: [-4.9, 0, 0], size: [1.0, 5.0], dir: 'v', color: '#7f1d1d', seatColor: '#ef4444' },
  ], []);

  // Weather effects mapping (Three.js Fog)
  const isRaining = weather?.condition === 'light-rain' || weather?.condition === 'heavy-rain' || weather?.condition === 'storm';
  const isCloudy = weather?.condition === 'cloudy';

  return (
    <>
      {/* ── Atmospheric fog based on weather context ── */}
      {isRaining && <fog attach="fog" args={['#070710', 8, 20]} />}
      {isCloudy && <fog attach="fog" args={['#0a0a16', 12, 25]} />}

      {/* ── Main evening lighting ── */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 15, 6]} intensity={1.2} color="#e0f2fe" castShadow />
      
      {/* ── Flooding spots at corners pointing to field ── */}
      <pointLight position={[6, 5, 4]} intensity={1.5} color="#fbbf24" distance={18} />
      <pointLight position={[-6, 5, -4]} intensity={1.5} color="#fbbf24" distance={18} />
      <pointLight position={[6, 5, -4]} intensity={1.5} color="#fbbf24" distance={18} />
      <pointLight position={[-6, 5, 4]} intensity={1.5} color="#fbbf24" distance={18} />

      {/* ── Central Pitch plane ── */}
      {pitchCanvas && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
          <planeGeometry args={[8.5, 5.6]} />
          <meshBasicMaterial>
            <canvasTexture attach="map" image={pitchCanvas} />
          </meshBasicMaterial>
        </mesh>
      )}

      {/* ── Green pitch borders ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[9.8, 6.8]} />
        <meshStandardMaterial color={isSimple ? '#092c1a' : '#061f12'} roughness={0.9} />
      </mesh>

      {/* ── 3D Realistic Seating Stands flanking the field ── */}
      {stands.map((stand, idx) => {
        const isHorizontal = stand.dir === 'h';
        return (
          <group key={idx} position={stand.pos}>
            {/* Step 1 (Lower Step concrete + seats) */}
            <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
              <boxGeometry args={isHorizontal ? [stand.size[0], 0.3, 0.35] : [0.35, 0.3, stand.size[1]]} />
              <meshStandardMaterial color={stand.color} roughness={0.8} />
            </mesh>
            <mesh position={isHorizontal ? [0, 0.31, 0.05] : [0.05, 0.31, 0]} castShadow>
              <boxGeometry args={isHorizontal ? [stand.size[0] - 0.1, 0.06, 0.2] : [0.2, 0.06, stand.size[1] - 0.1]} />
              <meshStandardMaterial color={stand.seatColor} roughness={0.5} />
            </mesh>

            {/* Step 2 (Middle Step concrete + seats) */}
            <mesh position={isHorizontal ? [0, 0.45, -0.3] : [-0.3, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={isHorizontal ? [stand.size[0], 0.3, 0.35] : [0.35, 0.3, stand.size[1]]} />
              <meshStandardMaterial color={stand.color} roughness={0.8} />
            </mesh>
            <mesh position={isHorizontal ? [0, 0.61, -0.25] : [-0.25, 0.61, 0]} castShadow>
              <boxGeometry args={isHorizontal ? [stand.size[0] - 0.1, 0.06, 0.2] : [0.2, 0.06, stand.size[1] - 0.1]} />
              <meshStandardMaterial color={stand.seatColor} roughness={0.5} />
            </mesh>

            {/* Step 3 (Upper Step concrete + seats) */}
            <mesh position={isHorizontal ? [0, 0.75, -0.6] : [-0.6, 0.75, 0]} castShadow receiveShadow>
              <boxGeometry args={isHorizontal ? [stand.size[0], 0.3, 0.35] : [0.35, 0.3, stand.size[1]]} />
              <meshStandardMaterial color={stand.color} roughness={0.8} />
            </mesh>
            <mesh position={isHorizontal ? [0, 0.91, -0.55] : [-0.55, 0.91, 0]} castShadow>
              <boxGeometry args={isHorizontal ? [stand.size[0] - 0.1, 0.06, 0.2] : [0.2, 0.06, stand.size[1] - 0.1]} />
              <meshStandardMaterial color={stand.seatColor} roughness={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* Concrete corner blocks linking the stands together */}
      {[[4.5, 3.8], [-4.5, 3.8], [4.5, -3.8], [-4.5, -3.8]].map(([cx, cz], i) => (
        <mesh key={i} position={[cx, 0.45, cz]} castShadow>
          <boxGeometry args={[0.8, 0.9, 0.8]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.9} />
        </mesh>
      ))}

      {/* Outer Concrete boundary wall */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[6.4, 6.4, 1.0, 32, 1, true]} />
        <meshStandardMaterial color="#0f0f1b" roughness={0.9} side={2} />
      </mesh>

      {/* Canopy Roof Ring hovering on top */}
      <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.8, 6.4, 32]} />
        <meshStandardMaterial color="#0b0b14" roughness={0.9} side={2} />
      </mesh>

      {/* ── Floodlight Towers (4 corners) with detailed bulb arrays ── */}
      {[[6.4, 4.6], [-6.4, 4.6], [6.4, -4.6], [-6.4, -4.6]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0, tz]}>
          {/* Main Lattice column */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.15, 5, 8]} />
            <meshStandardMaterial color="#2d2d44" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Bulb head rack */}
          <mesh position={[0, 5.0, 0]}>
            <boxGeometry args={[0.5, 0.35, 0.5]} />
            <meshStandardMaterial color="#1f1f2e" />
          </mesh>
          {/* Emissive spotlight bulb array */}
          <mesh position={[0, 5.0, 0.18]}>
            <boxGeometry args={[0.4, 0.25, 0.1]} />
            <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={3.0} />
          </mesh>
        </group>
      ))}

      {/* ── Dynamic Rain particle system ── */}
      {isRaining && <RainParticles />}

      {/* ── 3D Gate Beacons & Labels ── */}
      {gates.map((g) => {
        const coord = gate3DPositions[g.id];
        if (!coord) return null;

        const isSelected = selectedGateId === g.id;
        const isHovered = hoveredGateId === g.id;
        const rColor = riskColors[g.riskLevel];
        const showDynamicGlow = g.riskLevel === 'high' || g.riskLevel === 'critical';

        return (
          <group key={g.id} position={[coord.x, coord.y, coord.z]}>
            {/* 3D Gate Doorways structure */}
            <group
              onClick={(e) => {
                e.stopPropagation();
                if (onGateClick) onGateClick(g.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredGateId(g.id);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredGateId(null);
              }}
            >
              {/* Left Pillar Column (Light concrete gray) */}
              <mesh position={[-0.22, 0.2, 0]} castShadow>
                <boxGeometry args={[0.07, 0.5, 0.1]} />
                <meshStandardMaterial color="#a1a1aa" roughness={0.4} />
              </mesh>
              {/* Right Pillar Column */}
              <mesh position={[0.22, 0.2, 0]} castShadow>
                <boxGeometry args={[0.07, 0.5, 0.1]} />
                <meshStandardMaterial color="#a1a1aa" roughness={0.4} />
              </mesh>
              {/* Top cross beam */}
              <mesh position={[0, 0.45, 0]} castShadow>
                <boxGeometry args={[0.51, 0.08, 0.1]} />
                <meshStandardMaterial color="#71717a" roughness={0.4} />
              </mesh>
              {/* Glowing entry turnstile door panel */}
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.36, 0.38, 0.02]} />
                <meshStandardMaterial
                  color={rColor.fill}
                  emissive={rColor.glow}
                  emissiveIntensity={isSelected ? 3.0 : isHovered ? 2.0 : rColor.glowIntensity * 1.5}
                  transparent
                  opacity={0.88}
                  roughness={0.2}
                />
              </mesh>
            </group>

            {/* Glowing spot light under beacon for critical/high states */}
            {showDynamicGlow && (
              <pointLight
                position={[0, 0.1, 0]}
                color={rColor.glow}
                intensity={isSelected ? 3.5 : 2.0}
                distance={5}
              />
            )}

            {/* Selection ring in 3D */}
            {isSelected && (
              <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.42, 16]} />
                <meshBasicMaterial color={isSimple ? '#fbbf24' : '#818cf8'} side={2} />
              </mesh>
            )}

            {/* Floating label overlay */}
            <Html
              position={[0, 0.9, 0]}
              center
              distanceFactor={8}
              className="pointer-events-none select-none z-10"
            >
              <button
                onClick={() => onGateClick && onGateClick(g.id)}
                className={`flex items-center justify-center font-mono font-black text-center rounded-full text-xs transition-all pointer-events-auto shadow-md
                  ${isSelected ? 'h-7 w-7 border-2' : 'h-6 w-6 border'}
                `}
                style={{
                  backgroundColor: rColor.fill,
                  borderColor: isSelected ? (isSimple ? '#fbbf24' : '#818cf8') : rColor.stroke,
                  color: rColor.text,
                  boxShadow: showDynamicGlow ? `0 0 10px ${rColor.glow}` : 'none'
                }}
                aria-label={`Gate ${coord.label} status: ${g.riskLevel}`}
              >
                {coord.label}
              </button>
            </Html>
          </group>
        );
      })}
    </>
  );
};

// ─── Procedural Rain Particle System ───
const RainParticles: React.FC = () => {
  const count = 180;
  const meshRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spds = new Float32Array(count);
    let seed = 12345;
    const pseudoRandom = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (pseudoRandom() - 0.5) * 16;
      pos[i * 3 + 1] = pseudoRandom() * 8;
      pos[i * 3 + 2] = (pseudoRandom() - 0.5) * 16;
      spds[i] = 0.1 + pseudoRandom() * 0.15;
    }
    return [pos, spds];
  }, []);

  // Frame tick animation for rain drops
  useEffect(() => {
    let animationFrameId: number;
    const tick = () => {
      if (meshRef.current) {
        const geo = meshRef.current.geometry;
        const posAttr = geo.attributes.position;
        if (posAttr) {
          const arr = posAttr.array as Float32Array;
          for (let i = 0; i < count; i++) {
            arr[i * 3 + 1] -= speeds[i]; // move down
            if (arr[i * 3 + 1] < 0) {
              arr[i * 3 + 1] = 8; // reset to top
            }
          }
          posAttr.needsUpdate = true;
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(animationFrameId);
  }, [speeds]);

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a5f3fc"
        size={0.06}
        transparent
        opacity={0.6}
      />
    </points>
  );
};

// ─── MAIN PORTAL CONTAINER COMPONENT ─────────────────────────────────────────
export const StadiumTwinDiagram: React.FC<StadiumTwinDiagramProps> = ({
  stadiumContext,
  onGateClick,
  selectedGateId,
  variant = 'detailed',
}) => {
  const [hoveredGateId, setHoveredGateId] = useState<string | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  if (!stadiumContext) {
    return (
      <div className="h-96 rounded-large border border-[rgba(255,255,255,0.07)] bg-bg-card/20 flex items-center justify-center text-text-muted text-xs">
        No stadium context loaded for visualization.
      </div>
    );
  }

  const { gates = [], weather } = stadiumContext;
  const isSimple = variant === 'simple';
  const riskColors = isSimple ? simpleRiskColors : detailedRiskColors;

  const WeatherIcon = (() => {
    switch (weather?.condition) {
      case 'clear':       return Sun;
      case 'cloudy':      return Cloud;
      case 'light-rain':
      case 'heavy-rain':  return CloudRain;
      case 'storm':       return CloudLightning;
      default:            return Cloud;
    }
  })();

  // Loading state
  if (webglSupported === null) {
    return (
      <div className="h-[420px] rounded-large border border-[rgba(255,255,255,0.07)] bg-bg-card/20 flex flex-col items-center justify-center text-text-muted text-xs gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span>Initializing 3D Stadium Twin Scene...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative w-full">
      {/* Accessible parallel summary list for screen-readers (never visual-only) */}
      <div className="sr-only">
        <h2>Accessible Stadium Gate Summary</h2>
        <ul>
          {gates.map((g) => (
            <li key={g.id}>
              Gate {g.id.replace('gate-', '').toUpperCase()}: Status {g.riskLevel}, Occupancy {g.occupancyPercent}%, Queue estimate {g.queueEstimate} people.
            </li>
          ))}
        </ul>
      </div>

      {/* Main visualization container */}
      <div className="relative h-[360px] md:h-[420px] rounded-large overflow-hidden border border-zinc-800 bg-[#070710] shadow-2xl">
        {webglSupported ? (
          // ─── ThreeJS / React Three Fiber 3D Canvas ───
          <Canvas
            shadows
            camera={{ position: [0, 6.5, 9.5], fov: 45 }}
            style={{ pointerEvents: 'auto' }}
          >
            <color attach="background" args={['#070710']} />
            <Stadium3DModel
              gates={gates}
              weather={weather}
              onGateClick={onGateClick}
              selectedGateId={selectedGateId}
              variant={variant}
              hoveredGateId={hoveredGateId}
              setHoveredGateId={setHoveredGateId}
            />
            <OrbitControls
              enablePan={!isSimple}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={15}
              minPolarAngle={0.1}
              maxPolarAngle={Math.PI / 2.2} // prevent going below the ground plane
              autoRotate={isSimple}
              autoRotateSpeed={0.3}
            />
          </Canvas>
        ) : (
          // ─── Lightweight 2D SVG Fallback for devices without WebGL ───
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <svg
              viewBox="0 0 500 400"
              className="w-full h-full max-h-[380px]"
              aria-hidden="true"
            >
              {/* Outer Concrete boundary shadow */}
              <ellipse cx="250" cy="200" rx="215" ry="165" fill="#0d0d1a" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              {/* Seating stands tiers */}
              <ellipse cx="250" cy="200" rx="195" ry="145" fill={isSimple ? '#111128' : '#12122a'} stroke="rgba(255,255,255,0.04)" />
              <ellipse cx="250" cy="200" rx="175" ry="125" fill={isSimple ? '#17172e' : '#1a1a3a'} stroke="rgba(255,255,255,0.04)" />
              <ellipse cx="250" cy="200" rx="155" ry="105" fill={isSimple ? '#1c1c36' : '#1e1e42'} stroke="rgba(255,255,255,0.04)" />

              {/* Pitch layout */}
              <rect x="175" y="140" width="150" height="120" fill={isSimple ? '#0e3822' : '#0d3320'} rx="2" />
              <rect x="175" y="140" width="150" height="120" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
              <line x1="250" y1="140" x2="250" y2="260" stroke="rgba(255,255,255,0.5)" />
              <circle cx="250" cy="200" r="24" fill="none" stroke="rgba(255,255,255,0.5)" />

              {/* Draw 2D Gate Markers */}
              {gates.map((g) => {
                const coord = gate2DCoordinates[g.id];
                if (!coord) return null;
                const isSelected = selectedGateId === g.id;
                const colors = riskColors[g.riskLevel];

                return (
                  <g
                    key={g.id}
                    className="cursor-pointer transition-transform duration-medium hover:scale-110"
                    onClick={() => onGateClick && onGateClick(g.id)}
                    onMouseEnter={() => setHoveredGateId(g.id)}
                    onMouseLeave={() => setHoveredGateId(null)}
                  >
                    <circle cx={coord.x} cy={coord.y} r={isSelected ? 14 : 11} fill={colors.fill} stroke={isSelected ? '#fbbf24' : colors.stroke} strokeWidth={2} />
                    <text x={coord.x} y={coord.y + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill={colors.text}>{coord.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* ── Weather overlay badge inside the screen corner ── */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-medium bg-zinc-950/80 border border-zinc-800 text-[10px] text-text-secondary select-none font-mono">
          <IconWrapper icon={WeatherIcon} size="sm" className={weather?.condition === 'clear' ? 'text-amber-500' : 'text-blue-400'} />
          <span className="capitalize">{weather?.condition.replace('-', ' ')}</span>
          <span className="text-zinc-600">|</span>
          <span>{weather?.temperatureCelsius}°C</span>
        </div>

        {/* WebGL tag indicators in detailed Operations mode */}
        {!isSimple && (
          <div className="absolute bottom-3 left-3 z-20 px-2 py-1 rounded bg-zinc-950/80 border border-zinc-800 text-[8px] font-mono text-zinc-500 select-none">
            WebGL 3D Twin Engine ACTIVE
          </div>
        )}
      </div>

      {/* Keyboard accessible list for accessibility compliance */}
      <div className="mt-2 text-xs text-zinc-500 select-none">
        <label htmlFor="keyboard-gate-select" className="mr-2 font-medium">Keyboard Gate Select:</label>
        <select
          id="keyboard-gate-select"
          value={selectedGateId || ''}
          onChange={(e) => onGateClick && onGateClick(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded px-2.5 py-1"
        >
          <option value="">-- Choose Gate --</option>
          {gates.map((g) => {
            const coord = gate2DCoordinates[g.id];
            return (
              <option key={g.id} value={g.id}>
                Gate {coord ? coord.label : g.id.toUpperCase()} ({coord ? coord.name : ''}) - Risk: {g.riskLevel}
              </option>
            );
          })}
        </select>
      </div>

      {/* ─── INFO PANEL (identical props & rendering as flat SVG) ─── */}
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
            const coord = g ? gate2DCoordinates[g.id] : null;
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
