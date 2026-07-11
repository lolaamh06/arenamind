import React from 'react';
import { Badge } from '../atoms/Badge';
import { ProgressBar } from '../atoms/ProgressBar';
import { ConfidenceData } from '../../types/decision-brief';

export interface ConfidenceBadgeProps {
  confidence: ConfidenceData;
  showBar?: boolean;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  showBar = false,
  className = '',
}) => {
  const { percentage, label } = confidence;

  // Determine semantic color mappings based on confidence threshold limits
  let variant: 'resolved' | 'warning' | 'critical' = 'resolved';
  if (percentage < 50) {
    variant = 'critical';
  } else if (percentage < 80) {
    variant = 'warning';
  }

  return (
    <div className={`inline-flex flex-col gap-1.5 min-w-[120px] select-none ${className}`}>
      <div className="flex justify-between items-center gap-2">
        <Badge variant={variant === 'resolved' ? 'resolved' : variant === 'warning' ? 'warning' : 'critical'}>
          {label}
        </Badge>
        <span className="text-xs font-semibold font-mono text-text-primary">
          {percentage}%
        </span>
      </div>
      {showBar && (
        <ProgressBar
          value={percentage}
          variant={variant === 'resolved' ? 'resolved' : variant === 'warning' ? 'warning' : 'critical'}
        />
      )}
    </div>
  );
};
