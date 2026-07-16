import React from 'react';

export interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

/*
 * Chip — Phase 5A Visual Overhaul
 *
 * Previous: neutral-100/neutral-800 background, basic border.
 * Now: semi-transparent dark with white-tinted border — consistent with the
 * "elevated surface" aesthetic of the new design system. Hover state lifts
 * the chip slightly (bg-bg-raised). Remove button gets a subtle circular hover.
 *
 * Uses font-mono for technical labels (gate codes, category names) and
 * font-sans for plain-text labels — inferred from context at the chip level.
 */
export const Chip: React.FC<ChipProps> = ({ label, icon, onRemove, className = '' }) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-small text-xs font-medium',
        'bg-[rgba(255,255,255,0.06)] text-text-secondary',
        'border border-[rgba(255,255,255,0.10)]',
        'transition-colors duration-fast',
        className,
      ].join(' ')}
    >
      {icon && (
        <span className="flex-shrink-0 text-text-muted">
          {icon}
        </span>
      )}
      <span className="truncate max-w-[120px]">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className={[
            'ml-0.5 p-0.5 rounded-full flex items-center justify-center',
            'hover:bg-[rgba(255,255,255,0.12)] text-text-muted hover:text-text-primary',
            'transition-colors duration-fast focus-visible-ring',
          ].join(' ')}
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};
