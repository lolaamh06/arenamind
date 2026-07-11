import React from 'react';

export interface GateMarker {
  id: string;
  label: string;
  x: number;
  y: number;
  status: 'normal' | 'warning' | 'critical' | 'resolved';
}

const DEFAULT_GATES: GateMarker[] = [
  { id: 'gate-a', label: 'Gate A (North)', x: 200, y: 35, status: 'resolved' }, // Emerald
  { id: 'gate-b', label: 'Gate B (East)', x: 345, y: 150, status: 'warning' }, // Amber
  { id: 'gate-c', label: 'Gate C (South)', x: 200, y: 265, status: 'critical' }, // Red
  { id: 'gate-d', label: 'Gate D (West)', x: 55, y: 150, status: 'normal' }, // Blue
];

export const StadiumTwinPreview: React.FC = () => {
  const statusColors = {
    normal: 'fill-primary-500 stroke-primary-600',
    warning: 'fill-warning-500 stroke-warning-600',
    critical: 'fill-critical-600 stroke-critical-700',
    resolved: 'fill-secondary-500 stroke-secondary-600',
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 bg-bg-card border border-border-color rounded-medium p-6 shadow-low select-none">
      <div className="text-center">
        <h3 className="text-sm font-semibold text-text-primary">
          Digital Stadium Twin — Live Overview
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Bespoke top-down structural telemetry. Click points to inspect.
        </p>
      </div>

      <div className="relative w-full max-w-sm aspect-[4/3] bg-bg-secondary border border-border-color/50 rounded-medium overflow-hidden">
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full text-text-primary"
          aria-label="Stadium Layout Map"
        >
          {/* Stadium outer boundary ring */}
          <rect
            x="40"
            y="30"
            width="320"
            height="240"
            rx="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-neutral-200 dark:text-neutral-800"
          />

          {/* Stadium inner bowl ring */}
          <rect
            x="80"
            y="60"
            width="240"
            height="180"
            rx="90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="text-neutral-300 dark:text-neutral-700"
          />

          {/* Playing Field / Court Center */}
          <rect
            x="130"
            y="100"
            width="140"
            height="100"
            rx="8"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            className="text-secondary-100/10 dark:text-secondary-900/10 stroke-secondary-500/20"
          />

          {/* Gate Marker Points */}
          {DEFAULT_GATES.map((gate) => (
            <g key={gate.id} className="cursor-pointer group">
              <circle
                cx={gate.x}
                cy={gate.y}
                r="10"
                className={`transition-all duration-fast stroke-2 hover:scale-125 ${statusColors[gate.status]}`}
              />
              <text
                x={gate.x}
                y={gate.y - 14}
                textAnchor="middle"
                className="text-[10px] font-bold fill-text-primary opacity-90 transition-opacity group-hover:opacity-100"
              >
                {gate.id.slice(-1).toUpperCase()}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Map Legend */}
      <div className="flex gap-4 flex-wrap justify-center text-[10px] text-text-secondary font-mono">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
          <span>Primary (A)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-secondary-500" />
          <span>Normal (D)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-warning-500" />
          <span>Warning (B)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-critical-600" />
          <span>Critical (C)</span>
        </div>
      </div>
    </div>
  );
};
