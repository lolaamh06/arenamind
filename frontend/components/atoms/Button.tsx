import React from 'react';
import { ComponentSize } from '../../types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: ComponentSize;
  isLoading?: boolean;
}

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
    // Base interactive styles with accessible outline
    const baseStyle =
      'inline-flex items-center justify-center font-medium rounded-medium transition-colors duration-fast focus-visible-ring select-none active:scale-[0.98] cursor-pointer';

    // Variant classes mapping to the theme tokens
    const variantStyles = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500',
      secondary:
        'border border-border-color hover:bg-bg-secondary text-text-primary disabled:border-neutral-200 disabled:text-neutral-400 dark:disabled:border-neutral-800 dark:disabled:text-neutral-500',
      ghost: 'hover:bg-bg-secondary text-text-secondary hover:text-text-primary disabled:text-neutral-400 dark:disabled:text-neutral-500',
      danger: 'bg-critical-600 hover:bg-critical-700 text-white disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500',
    };

    // Size classes (multiple of 8px)
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
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
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
