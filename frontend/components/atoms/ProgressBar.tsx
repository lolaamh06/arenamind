import React from 'react';
import { Severity } from '../../types';

export interface ProgressBarProps {
  value: number; // 0 to 100
  variant?: Severity | 'neutral' | 'primary';
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'primary',
  className = '',
  showLabel = false,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const fillColors = {
    normal: 'bg-primary-600',
    primary: 'bg-primary-600',
    warning: 'bg-warning-500',
    critical: 'bg-critical-600',
    resolved: 'bg-secondary-500',
    neutral: 'bg-neutral-400 dark:bg-neutral-600',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-secondary mb-1 font-medium font-mono">
          <span>Progress</span>
          <span>{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden border border-border-color/50">
        <div
          className={`h-full rounded-full transition-all duration-medium ease-out ${fillColors[variant]}`}
          style={{ width: `${clampedValue}%` }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
