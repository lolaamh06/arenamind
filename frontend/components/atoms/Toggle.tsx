import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/*
 * Toggle — Phase 5A Visual Overhaul
 *
 * Previous: neutral-200 track off, primary-600 on. Flat thumb.
 * Now:
 *   Off track — rgba dark with subtle border (not jarring gray)
 *   On track  — Indigo with soft glow box-shadow (matches primary accent glow pattern)
 *   Thumb     — Slightly smaller (w-4 h-4 in a h-5 track) with shadow for depth,
 *               appears to "float" above the track surface.
 *   Label     — Weight and size refined.
 */
export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={[
          'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer',
          'rounded-full border transition-all duration-fast ease-in-out',
          'focus-visible-ring',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          checked
            ? 'bg-primary-600 border-primary-500/60 shadow-[0_0_8px_rgba(99,102,241,0.35)]'
            : 'bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.12)]',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white',
            'absolute top-[3px] transition-all duration-fast ease-in-out',
            'shadow-[0_1px_4px_rgba(0,0,0,0.5)]',
            checked ? 'left-[18px]' : 'left-[3px]',
          ].join(' ')}
        />
      </button>
      {label && (
        <span className="text-sm font-medium text-text-secondary">
          {label}
        </span>
      )}
    </div>
  );
};
