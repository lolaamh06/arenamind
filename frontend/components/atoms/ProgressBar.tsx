import React from 'react';
import { Severity } from '../../types';

export interface ProgressBarProps {
  value: number; // 0 to 100
  variant?: Severity | 'neutral' | 'primary';
  className?: string;
  showLabel?: boolean;
}

/*
 * ProgressBar — Phase 5A Visual Overhaul
 *
 * Previous: flat colored fills on a neutral track.
 * Now:
 *   Track — uses bg-bg-raised (elevated dark) with subtle border, no pure-gray neutral.
 *   Fill  — uses the correct status color from the new token system.
 *          Critical/High fills add a colored box-shadow glow to the bar itself
 *          (not just a color change) — critical data needs visual weight.
 *   Height — increased from h-2 to h-1.5 (still compact) with rounded-full.
 *   Label  — uses JetBrains Mono for numeric % value.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'primary',
  className = '',
  showLabel = false,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const fillConfig: Record<
    NonNullable<ProgressBarProps['variant']>,
    { classes: string; glow?: string }
  > = {
    normal: {
      classes: 'bg-[#34d399]',
      glow: undefined,
    },
    primary: {
      classes: 'bg-primary-500',
      glow: undefined,
    },
    warning: {
      classes: 'bg-[#fbbf24]',
      glow: '0 0 8px rgba(245,158,11,0.40)',
    },
    critical: {
      classes: 'bg-[#f87171]',
      glow: '0 0 10px rgba(239,68,68,0.50)',
    },
    resolved: {
      classes: 'bg-[#34d399]',
      glow: '0 0 8px rgba(16,185,129,0.35)',
    },
    neutral: {
      classes: 'bg-[rgba(255,255,255,0.20)]',
      glow: undefined,
    },
  };

  const config = fillConfig[variant];

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-[11px] text-text-secondary mb-1.5 font-mono">
          <span className="font-medium tracking-wider uppercase text-[10px]">Progress</span>
          <span className="font-bold text-text-primary">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full h-1.5 overflow-hidden"
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className={`h-full rounded-full transition-all duration-medium ease-out ${config.classes}`}
          style={{
            width: `${clampedValue}%`,
            boxShadow: config.glow,
          }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
