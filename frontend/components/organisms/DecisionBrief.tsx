import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertOctagon, AlertTriangle, CheckCircle, Info, History } from 'lucide-react';
import { AIDecisionBrief } from '../../types/decision-brief';
import { Audience } from '../../types';
import { ConfidenceBadge } from '../molecules/ConfidenceBadge';
import { EvidenceChip } from '../molecules/EvidenceChip';
import { IconWrapper } from '../atoms/IconWrapper';
import { Button } from '../atoms/Button';

export interface DecisionBriefProps {
  brief: AIDecisionBrief;
  audienceOverride?: Audience;
  className?: string;
}

export const DecisionBrief: React.FC<DecisionBriefProps> = ({
  brief,
  audienceOverride,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const targetAudience = audienceOverride || brief.audience;

  const isFan = targetAudience === 'fan';
  const isVolunteer = targetAudience === 'volunteer';

  // Map severity levels to semantic visual frames
  const severityConfig = {
    normal: {
      border: 'border-l-4 border-l-primary-500 border-border-color',
      icon: Info,
      iconColor: 'text-primary-500',
      bg: 'bg-bg-card',
    },
    warning: {
      border: 'border-l-4 border-l-warning-500 border-border-color',
      icon: AlertTriangle,
      iconColor: 'text-warning-500',
      bg: 'bg-bg-card',
    },
    critical: {
      border: 'border-l-4 border-l-critical-600 border-border-color',
      icon: AlertOctagon,
      iconColor: 'text-critical-600',
      bg: 'bg-bg-card',
    },
    resolved: {
      border: 'border-l-4 border-l-secondary-500 border-border-color',
      icon: CheckCircle,
      iconColor: 'text-secondary-500',
      bg: 'bg-bg-card',
    },
  };

  const config = severityConfig[brief.severity] || severityConfig.normal;

  return (
    <article
      className={`rounded-medium border shadow-low transition-all duration-medium overflow-hidden ${config.border} ${config.bg} ${className}`}
    >
      {/* Collapsed Header Portion */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <IconWrapper icon={config.icon} size="md" className={config.iconColor} />
            <h2 className="text-sm font-semibold tracking-tight text-text-primary">
              {brief.title}
            </h2>
          </div>
          {/* Hide numeric indicator or badge customization for fans */}
          {!isVolunteer && (
            <ConfidenceBadge
              confidence={{
                percentage: brief.confidence.percentage,
                label: brief.confidence.label,
              }}
              showBar={!isFan}
              className={isFan ? 'opacity-80 scale-95' : ''}
            />
          )}
        </div>

        {/* Core Recommendation Callout */}
        <div className="p-3 bg-bg-secondary rounded-medium border border-border-color/50">
          <p className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-1 text-primary-600 dark:text-primary-400">
            {isFan ? 'Recommended Action' : 'AI Recommendation'}
          </p>
          <p className="text-sm text-text-primary leading-relaxed font-medium">
            {brief.recommendation}
          </p>
        </div>

        {/* Explain affordance trigger */}
        <div className="flex justify-between items-center gap-4 mt-1">
          <span className="text-xs text-text-muted font-mono">{brief.timestamp}</span>
          <div className="flex gap-2">
            {!isFan && (targetAudience === 'operations' || targetAudience === 'judge') && (
              <Button
                variant="ghost"
                size="sm"
                className="text-text-muted hover:text-text-primary gap-1"
                onClick={() => alert('Decision history is disabled in scaffolding phase')}
              >
                <IconWrapper icon={History} size="sm" />
                <span>History</span>
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1"
            >
              <span>{isExpanded ? 'Hide Details' : 'Explain Why'}</span>
              <IconWrapper icon={isExpanded ? ChevronUp : ChevronDown} size="sm" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded reasoning panel with transition wrapper */}
      <div
        className={`transition-all duration-medium ease-in-out border-t border-border-color
          ${isExpanded ? 'max-h-[1000px] opacity-100 p-4' : 'max-h-0 opacity-0 pointer-events-none'}`}
      >
        <div className="space-y-4">
          {/* Context Situation summary */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Situation Context
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              {brief.situationSummary}
            </p>
          </div>

          {/* Evidence aggregation */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Supporting Evidence
            </h4>
            <div className="flex flex-wrap gap-2">
              {brief.evidence.map((ev, i) => (
                <EvidenceChip key={i} label={ev.label} category={ev.category} />
              ))}
            </div>
          </div>

          {/* Detailed explanation/reasoning chain */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              AI Reasoning & Analysis
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed bg-bg-secondary p-3 rounded-medium border border-border-color/30">
              {brief.explanation}
            </p>
          </div>

          {/* Alternatives Considered - Omit for Fans and Volunteers */}
          {!isFan && !isVolunteer && brief.alternativesConsidered.length > 0 && (
            <div className="space-y-2 border-t border-border-color/50 pt-3">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Alternatives Considered
              </h4>
              <ul className="space-y-2">
                {brief.alternativesConsidered.map((alt, i) => (
                  <li
                    key={i}
                    className="text-xs p-2 rounded-medium bg-neutral-50 border border-border-color/30 dark:bg-neutral-900/30"
                  >
                    <span className="font-semibold text-text-primary block mb-0.5">
                      Option: {alt.label}
                    </span>
                    <span className="text-text-secondary">
                      Reason Not Chosen: {alt.reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
