'use client';

import React from 'react';
import { DecisionBrief } from '../../types';
import { History, Eye, ArrowRight } from 'lucide-react';
import { Badge } from '../atoms/Badge';
import { IconWrapper } from '../atoms/IconWrapper';

export interface RecentDecisionsLogProps {
  history: DecisionBrief[];
  onSelectBrief: (brief: DecisionBrief) => void;
  activeBriefId?: string;
}

export const RecentDecisionsLog: React.FC<RecentDecisionsLogProps> = ({
  history,
  onSelectBrief,
  activeBriefId,
}) => {
  const urgencyBadgeVariants = {
    low: 'neutral' as const,
    moderate: 'normal' as const,
    high: 'warning' as const,
    critical: 'critical' as const,
  };

  return (
    <div className="bg-bg-card border border-border-color rounded-medium shadow-low flex flex-col h-[380px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-color flex justify-between items-center bg-bg-secondary/40 select-none">
        <div className="flex items-center gap-2">
          <IconWrapper icon={History} size="md" className="text-text-secondary" />
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">
            Recent Decisions Log
          </h3>
        </div>
        <span className="text-[10px] text-text-muted font-bold font-mono">
          {history.length} briefs in memory
        </span>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-color/50">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6 text-center text-xs text-text-muted">
            No decision briefs generated yet during this session.
          </div>
        ) : (
          history.map((brief) => {
            const isActive = brief.id === activeBriefId;
            const formattedTime = new Date(brief.generatedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={brief.id}
                onClick={() => onSelectBrief(brief)}
                role="button"
                tabIndex={0}
                className={`p-3 text-left transition-all duration-fast hover:bg-bg-secondary flex flex-col gap-2 cursor-pointer ${
                  isActive ? 'bg-primary-50/20 dark:bg-primary-950/10 border-l-2 border-l-primary-500' : ''
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectBrief(brief);
                  }
                }}
              >
                {/* Meta details line */}
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-mono">{formattedTime}</span>
                    <span className="text-[11px] font-bold text-text-secondary capitalize">
                      {brief.trigger.reference.replace('gate-', 'Gate ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {brief.isValid ? (
                      <>
                        <Badge
                          variant={urgencyBadgeVariants[brief.urgency || 'low']}
                          className="text-[9px] uppercase tracking-wider px-1 py-0.2"
                        >
                          {brief.urgency}
                        </Badge>
                        <span className="text-[10px] font-bold font-mono text-text-secondary">
                          {brief.confidence.score}%
                        </span>
                      </>
                    ) : (
                      <Badge variant="critical" className="text-[9px] uppercase tracking-wider px-1 py-0.2">
                        FAILED
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content teaser */}
                <div className="flex justify-between items-end gap-4">
                  <p className="text-[11px] text-text-primary line-clamp-2 leading-relaxed flex-1 font-medium">
                    {brief.isValid ? brief.recommendation : 'AI operational brief request failed due to validation error.'}
                  </p>
                  <IconWrapper
                    icon={isActive ? Eye : ArrowRight}
                    size="sm"
                    className={isActive ? 'text-primary-500' : 'text-text-muted'}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
