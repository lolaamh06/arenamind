import React from 'react';
import { LucideIcon } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export interface TimelineItemProps {
  title: string;
  timestamp: string;
  description: string;
  icon?: LucideIcon;
  variant?: 'normal' | 'warning' | 'critical' | 'resolved';
  isLast?: boolean;
  className?: string;
}

/*
 * TimelineItem — Phase 5A Visual Overhaul
 *
 * Previous: light-mode bg colors for icon containers with dark: overrides.
 * Now: purely dark-first semi-transparent tinted containers per variant —
 *   consistent with the new Badge and EvidenceChip treatment.
 *
 * Icon node: gets the matching hue tint (emerald/amber/red/indigo) with a subtle
 *   glow box-shadow on critical/warning variants so the urgency is visible at
 *   a glance when scanning a vertical timeline.
 *
 * Connector line: uses the new rgba border token (white-tinted) instead of
 *   bg-border-color for a more refined, less harsh appearance.
 *
 * Timestamp: uses font-mono — it's a data value, not prose.
 * Title: uses font-display for slightly elevated typographic presence.
 */
export const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  timestamp,
  description,
  icon,
  variant = 'normal',
  isLast = false,
  className = '',
}) => {
  type VariantStyle = {
    container: string;
    glow?: string;
    line: string;
  };

  const iconConfig: Record<NonNullable<TimelineItemProps['variant']>, VariantStyle> = {
    normal: {
      container: 'bg-[rgba(99,102,241,0.14)] border-[rgba(99,102,241,0.28)] text-[#818cf8]',
      line: 'bg-[rgba(255,255,255,0.07)]',
    },
    warning: {
      container: 'bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.30)] text-[#fcd34d]',
      glow: '0 0 10px rgba(245,158,11,0.25)',
      line: 'bg-[rgba(245,158,11,0.15)]',
    },
    critical: {
      container: 'bg-[rgba(239,68,68,0.14)] border-[rgba(239,68,68,0.35)] text-[#f87171]',
      glow: '0 0 12px rgba(239,68,68,0.30)',
      line: 'bg-[rgba(239,68,68,0.18)]',
    },
    resolved: {
      container: 'bg-[rgba(16,185,129,0.10)] border-[rgba(16,185,129,0.25)] text-[#34d399]',
      line: 'bg-[rgba(16,185,129,0.15)]',
    },
  };

  const config = iconConfig[variant];

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Icon node + connector line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={[
            'flex items-center justify-center h-8 w-8 rounded-full border',
            config.container,
          ].join(' ')}
          style={config.glow ? { boxShadow: config.glow } : undefined}
        >
          {icon && <IconWrapper icon={icon} size="sm" />}
        </div>
        {!isLast && (
          <div
            className={`w-px grow mt-2 ${config.line}`}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-6 space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className="text-sm font-semibold text-text-primary"
            style={{ fontFamily: 'var(--font-display, var(--font-space-grotesk, sans-serif))' }}
          >
            {title}
          </h3>
          <time className="text-[10px] text-text-muted font-mono tracking-wide">
            {timestamp}
          </time>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
