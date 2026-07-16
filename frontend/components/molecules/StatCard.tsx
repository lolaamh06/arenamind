import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  icon?: LucideIcon;
  className?: string;
}

/*
 * StatCard — Phase 5A Visual Overhaul
 *
 * Previous: flat bg-bg-card with standard border/shadow.
 * Now:
 *   - Surface: bg-bg-card with the new layered shadow (shadow-medium includes
 *     an inset top highlight that creates a subtle "glass panel" feel).
 *   - Label: uppercase tracked mono-style text, now slightly larger for legibility.
 *   - Value: uses Space Grotesk display font — numbers look authoritative and
 *     proportional with the geometric typeface (vs Inter which is readable but
 *     less visually striking for large stat figures).
 *   - Icon: sits in a small tinted "icon box" rather than bare — gives it
 *     visual structure and stops it floating disconnected.
 *   - Trend: emerald/red tinted text with matching icon, compact pill-style.
 *   - Border: uses the new rgba white-tinted border, not neutral-200.
 *   - On hover: the card subtly lifts (box-shadow upgrade), consistent with
 *     the Grafana/Linear interactive card pattern.
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  trendLabel,
  icon,
  className = '',
}) => {
  const trendConfig = {
    up:     { icon: TrendingUp,   color: 'text-[#34d399]', bg: 'bg-[rgba(52,211,153,0.12)]' },
    down:   { icon: TrendingDown, color: 'text-[#f87171]', bg: 'bg-[rgba(239,68,68,0.12)]' },
    stable: { icon: Minus,        color: 'text-text-muted', bg: 'bg-[rgba(255,255,255,0.06)]' },
  };

  return (
    <div
      className={[
        'p-4 rounded-large select-none flex flex-col justify-between gap-3',
        'bg-bg-card border border-[rgba(255,255,255,0.07)]',
        'shadow-[0_2px_4px_rgba(0,0,0,0.5),0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)]',
        'transition-all duration-fast',
        'hover:border-[rgba(255,255,255,0.13)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]',
        className,
      ].join(' ')}
    >
      <div className="flex justify-between items-start gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted font-sans">
          {label}
        </span>
        {icon && (
          <div className="h-7 w-7 rounded-medium flex items-center justify-center shrink-0 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]">
            <IconWrapper icon={icon} size="sm" className="text-text-secondary" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span
          className="text-2xl font-bold tracking-tight text-text-primary"
          style={{ fontFamily: 'var(--font-display, var(--font-space-grotesk, sans-serif))' }}
        >
          {value}
        </span>
        {trend && (
          <div
            className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-small ${trendConfig[trend].color} ${trendConfig[trend].bg}`}
          >
            <IconWrapper icon={trendConfig[trend].icon} size="sm" />
            {trendLabel && <span>{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
