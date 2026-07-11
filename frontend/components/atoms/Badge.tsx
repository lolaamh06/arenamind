import React from 'react';
import { Severity } from '../../types';

export interface BadgeProps {
  variant?: Severity | 'neutral' | 'primary';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  const baseStyle =
    'inline-flex items-center px-2 py-0.5 rounded-small text-xs font-semibold select-none';

  const variantStyles = {
    normal: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    warning: 'bg-warning-50 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
    critical: 'bg-critical-50 text-critical-700 dark:bg-critical-900/30 dark:text-critical-300',
    resolved: 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300',
    neutral: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  };

  return <span className={`${baseStyle} ${variantStyles[variant]} ${className}`}>{children}</span>;
};
