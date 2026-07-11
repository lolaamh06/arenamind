import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className = '', disabled, ...props }, ref) => {
    const id = useId();
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;

    return (
      <div className="flex flex-col gap-2 w-full">
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          aria-invalid={!!error}
          className={`px-3 py-2 text-sm bg-bg-primary border rounded-medium text-text-primary focus-visible-ring placeholder-text-muted transition-colors duration-fast disabled:bg-neutral-50 disabled:text-text-muted dark:disabled:bg-neutral-900
            ${error ? 'border-critical-500' : 'border-border-color'}
            ${className}`}
          {...props}
        />
        {error && (
          <span id={errorId} className="text-xs text-critical-600 dark:text-critical-400 font-medium">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={helperId} className="text-xs text-text-muted">
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
