import React from 'react';
import { Badge } from '../atoms/Badge';
import { ProgressBar } from '../atoms/ProgressBar';
import { ConfidenceData } from '../../types/decision-brief';

export interface ConfidenceBadgeProps {
  confidence: ConfidenceData;
  showBar?: boolean;
  className?: string;
}

/*
 * ConfidenceBadge — Phase 5A Visual Overhaul
 *
 * Previous: percentage number in plain text beside a flat Badge.
 * Now:
 *   - Percentage uses font-mono (JetBrains Mono) — data values are always mono.
 *   - The badge label uses the new tinted Badge variants.
 *   - ProgressBar uses the glowing fill for critical/warning confidence thresholds.
 *   - Container gets a subtle surface treatment when showBar is true, giving it
 *     a card-like presence for higher-hierarchy usage contexts.
 *
 * Confidence thresholds (unchanged logic, new presentation):
 *   ≥80% → resolved (emerald) — high confidence, act on it
 *   50–79% → warning (amber) — moderate, use with caution
 *   <50%  → critical (red)   — low confidence, treat recommendation cautiously
 */
export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  showBar = false,
  className = '',
}) => {
  const { percentage, label } = confidence;

  let variant: 'resolved' | 'warning' | 'critical' = 'resolved';
  if (percentage < 50) {
    variant = 'critical';
  } else if (percentage < 80) {
    variant = 'warning';
  }

  return (
    <div
      className={`inline-flex flex-col gap-2 min-w-[130px] select-none ${className}`}
    >
      <div className="flex justify-between items-center gap-3">
        <Badge variant={variant}>
          {label}
        </Badge>
        <span
          className="text-xs font-bold font-mono tabular-nums"
          style={{
            color:
              variant === 'resolved'
                ? '#34d399'
                : variant === 'warning'
                  ? '#fcd34d'
                  : '#f87171',
          }}
        >
          {percentage}%
        </span>
      </div>
      {showBar && (
        <ProgressBar
          value={percentage}
          variant={variant}
        />
      )}
    </div>
  );
};
