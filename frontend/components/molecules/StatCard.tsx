import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { IconWrapper } from '../atoms/IconWrapper';

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  icon?: LucideIcon;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  trendLabel,
  icon,
  className = '',
}) => {
  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-secondary-600 dark:text-secondary-400' },
    down: { icon: TrendingDown, color: 'text-critical-600 dark:text-critical-400' },
    stable: { icon: Minus, color: 'text-text-muted' },
  };

  return (
    <div
      className={`p-4 bg-bg-card border border-border-color rounded-medium shadow-low flex flex-col justify-between gap-2 select-none ${className}`}
    >
      <div className="flex justify-between items-start gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
        {icon && <IconWrapper icon={icon} size="md" className="text-text-muted" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-text-primary">
          {value}
        </span>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendConfig[trend].color}`}>
            <IconWrapper icon={trendConfig[trend].icon} size="sm" />
            {trendLabel && <span>{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
