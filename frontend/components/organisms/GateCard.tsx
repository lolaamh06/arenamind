'use client';

import React from 'react';
import { ArrowUp, ArrowRight, ArrowDown, HelpCircle, LucideIcon } from 'lucide-react';
import { Gate, RiskLevel, TrendDirection } from '../../types';
import { Badge } from '../atoms/Badge';
import { IconWrapper } from '../atoms/IconWrapper';

export interface GateCardProps {
  gate: Gate;
  onClick?: () => void;
  isActive?: boolean;
}

export const GateCard: React.FC<GateCardProps> = ({ gate, onClick, isActive = false }) => {
  const trendIcons: Record<TrendDirection, LucideIcon> = {
    increasing: ArrowUp,
    stable: ArrowRight,
    decreasing: ArrowDown,
  };

  const trendColors: Record<TrendDirection, string> = {
    increasing: 'text-critical-600 dark:text-critical-400',
    stable: 'text-text-muted',
    decreasing: 'text-secondary-600 dark:text-secondary-400',
  };

  const riskBadgeVariants: Record<RiskLevel, 'neutral' | 'normal' | 'warning' | 'critical' | 'resolved' | 'primary'> = {
    low: 'neutral',
    moderate: 'normal',
    high: 'warning',
    critical: 'critical',
  };

  const TrendIcon = trendIcons[gate.trend] || HelpCircle;

  // Visual frame styling based on risk state or selection active
  const riskBorder =
    gate.riskLevel === 'critical'
      ? 'border-critical-600/50 bg-critical-50/5 dark:bg-critical-950/5'
      : gate.riskLevel === 'high'
        ? 'border-warning-500/40 bg-warning-50/5 dark:bg-warning-950/5'
        : 'border-border-color bg-bg-card';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Gate status details for ${gate.displayName}. Occupancy is ${gate.occupancyPercent}% with ${gate.riskLevel} risk.`}
      className={`p-4 border rounded-medium shadow-low flex flex-col justify-between gap-3 select-none transition-all duration-medium hover:shadow-medium cursor-pointer ${
        isActive ? 'ring-2 ring-primary-500 scale-[1.01]' : ''
      } ${riskBorder}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-text-muted font-mono">{gate.id.toUpperCase()}</span>
          <span className="text-sm font-semibold tracking-tight text-text-primary">
            {gate.displayName.split('—')[0].trim()}
          </span>
        </div>
        <Badge variant={riskBadgeVariants[gate.riskLevel]} className="capitalize">
          {gate.riskLevel}
        </Badge>
      </div>

      <div className="flex justify-between items-end gap-2 border-t border-border-color/30 pt-2.5">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-text-muted font-bold tracking-wider">
            Occupancy
          </span>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            {gate.occupancyPercent}%
          </span>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <IconWrapper
              icon={TrendIcon}
              size="sm"
              className={trendColors[gate.trend]}
            />
            <span className={`text-[10px] font-semibold capitalize ${trendColors[gate.trend]}`}>
              {gate.trend}
            </span>
          </div>
          <span className="text-[11px] text-text-secondary mt-0.5 font-medium">
            Queue: {gate.queueEstimate} min
          </span>
        </div>
      </div>

      <div className="text-[10px] text-text-secondary line-clamp-1">
        Serves: {gate.servedSections.join(', ')}
      </div>
    </div>
  );
};
