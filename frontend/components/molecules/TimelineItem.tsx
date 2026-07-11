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

export const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  timestamp,
  description,
  icon,
  variant = 'normal',
  isLast = false,
  className = '',
}) => {
  const iconColors = {
    normal: 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-950/40 dark:text-primary-400 dark:border-primary-800',
    warning: 'bg-warning-50 text-warning-600 border-warning-200 dark:bg-warning-950/40 dark:text-warning-400 dark:border-warning-800',
    critical: 'bg-critical-50 text-critical-600 border-critical-200 dark:bg-critical-950/40 dark:text-critical-400 dark:border-critical-800',
    resolved: 'bg-secondary-50 text-secondary-600 border-secondary-200 dark:bg-secondary-950/40 dark:text-secondary-400 dark:border-secondary-800',
  };

  return (
    <div className={`flex gap-4 ${className}`}>
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`flex items-center justify-center h-8 w-8 rounded-full border ${iconColors[variant]} shadow-low`}
        >
          {icon && <IconWrapper icon={icon} size="sm" />}
        </div>
        {!isLast && (
          <div className="w-[2px] grow bg-border-color mt-2" aria-hidden="true" />
        )}
      </div>
      <div className="pb-6 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <time className="text-xs text-text-muted font-mono">{timestamp}</time>
        </div>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </div>
  );
};
