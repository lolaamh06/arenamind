import React from 'react';
import { ComponentSize } from '../../types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: ComponentSize;
  isLoading?: boolean;
}

/*
 * Button — Phase 5A Visual Overhaul
 *
 * Previous: flat bg-primary-600 fills, generic hover states.
 * Now:
 *   primary  — Indigo fill with box-shadow glow on hover. Slight inner highlight
 *              (inset top border) mimics 3D button feel common in premium UIs.
 *   secondary — Transparent with bordered treatment + subtle fill on hover.
 *              Border uses the strong border token (more visible than default).
 *   ghost    — Text-only, barely-there hover fill, used for tertiary actions.
 *   danger   — Red fill with critical glow on hover.
 *
 * All transitions use --animate-fast (120ms) for snappy interactive feedback.
 * active:scale gives tactile "press" sensation without JS.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyle = [
      'inline-flex items-center justify-center font-semibold font-sans rounded-medium',
      'transition-all duration-fast focus-visible-ring select-none',
      'active:scale-[0.97] cursor-pointer',
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
    ].join(' ');

    const variantStyles = {
      primary: [
        'bg-primary-600 text-white',
        'hover:bg-primary-500',
        'hover:shadow-[0_0_0_1px_rgba(129,140,248,0.25),0_4px_16px_rgba(99,102,241,0.30)]',
        'shadow-[0_1px_0_rgba(255,255,255,0.10)_inset]',
      ].join(' '),

      secondary: [
        'bg-transparent text-text-primary',
        'border border-[rgba(255,255,255,0.13)]',
        'hover:bg-bg-raised hover:border-[rgba(255,255,255,0.20)]',
      ].join(' '),

      ghost: [
        'bg-transparent text-text-secondary',
        'hover:bg-[rgba(255,255,255,0.06)] hover:text-text-primary',
      ].join(' '),

      danger: [
        'bg-critical-700 text-white',
        'hover:bg-critical-600',
        'hover:shadow-[0_0_0_1px_rgba(239,68,68,0.30),0_4px_16px_rgba(239,68,68,0.25)]',
        'shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]',
      ].join(' '),
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs tracking-wide gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-2.5 text-base gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-0.5 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading…</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
