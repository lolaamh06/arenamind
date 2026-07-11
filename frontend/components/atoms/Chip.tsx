import React from 'react';

export interface ChipProps {
  label: string;
  icon?: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({ label, icon, onRemove, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-small text-xs font-medium bg-neutral-100 text-text-secondary border border-border-color dark:bg-neutral-800/50 ${className}`}
    >
      {icon && <span className="flex-shrink-0 text-text-muted">{icon}</span>}
      <span className="truncate max-w-[120px]">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="ml-1 p-0.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-text-muted hover:text-text-primary focus-visible-ring"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};
