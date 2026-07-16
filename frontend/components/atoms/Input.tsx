import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

/*
 * Input — Phase 5A Visual Overhaul
 *
 * Previous: plain bg-bg-primary bordered box.
 * Now: bg-bg-secondary (one elevation step lower than card) so the input
 *   recesses visually relative to the card surface — matches premium
 *   dashboard pattern where inputs "sink" into the surface.
 *
 * Focus: replaces outline with glowing indigo ring matching the new accent.
 * Error: preserves red border but uses the new critical color token.
 * All transitions 120ms.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className = '', disabled, ...props }, ref) => {
    const id = useId();
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          aria-invalid={!!error}
          className={[
            'px-3 py-2 text-sm font-sans bg-bg-secondary',
            'border rounded-medium text-text-primary',
            'placeholder:text-text-muted',
            'transition-all duration-fast',
            'focus:outline-none',
            'focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/60',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error
              ? 'border-[rgba(239,68,68,0.50)] focus:ring-critical-500/30 focus:border-critical-500/60'
              : 'border-[rgba(255,255,255,0.10)] hover:border-[rgba(255,255,255,0.18)]',
            className,
          ].join(' ')}
          {...props}
        />
        {error && (
          <span id={errorId} className="text-[11px] text-[#f87171] font-medium">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={helperId} className="text-[11px] text-text-muted leading-snug">
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
