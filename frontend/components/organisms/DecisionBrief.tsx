import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertOctagon, AlertTriangle, Info, History } from 'lucide-react';
import { DecisionBrief as ApiDecisionBrief, Audience } from '../../types';
import { ConfidenceBadge } from '../molecules/ConfidenceBadge';
import { EvidenceChip } from '../molecules/EvidenceChip';
import { IconWrapper } from '../atoms/IconWrapper';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

export interface DecisionBriefProps {
  brief: ApiDecisionBrief | null;
  isLoading?: boolean;
  audienceOverride?: Audience;
  className?: string;
  onShowHistory?: () => void;
}

export const DecisionBrief: React.FC<DecisionBriefProps> = ({
  brief,
  isLoading = false,
  audienceOverride,
  className = '',
  onShowHistory,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <article
        className={`rounded-medium border shadow-low overflow-hidden border-neutral-200 dark:border-neutral-800 bg-bg-card p-4 space-y-4 animate-pulse ${className}`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="w-32 h-4 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
          <div className="w-20 h-6 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
        <div className="space-y-2 p-3 bg-bg-secondary rounded-medium border border-border-color/50">
          <div className="w-24 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="w-full h-5 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="w-16 h-3 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="w-24 h-8 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
      </article>
    );
  }

  // If no brief is selected or passed yet, show empty state
  if (!brief) {
    return (
      <article
        className={`rounded-medium border border-dashed shadow-low bg-bg-card p-6 flex flex-col items-center justify-center text-center text-text-secondary ${className}`}
      >
        <IconWrapper icon={Info} size="lg" className="text-text-muted mb-2" />
        <h3 className="text-sm font-semibold">No Recommendation Selected</h3>
        <p className="text-xs text-text-muted mt-1 max-w-[280px]">
          Select a gate or trigger a scenario mutation to view a live AI operational recommendation.
        </p>
      </article>
    );
  }

  // 2. Graceful Failure State (isValid === false)
  if (!brief.isValid) {
    return (
      <article
        className={`rounded-medium border border-l-4 border-l-critical-600 border-neutral-200 dark:border-neutral-800 bg-bg-card p-4 space-y-3 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <IconWrapper icon={AlertOctagon} size="md" className="text-critical-600" />
          <h2 className="text-sm font-semibold tracking-tight text-text-primary">
            AI Recommendation Failed
          </h2>
        </div>
        <div className="p-3 bg-critical-50/20 dark:bg-critical-900/10 rounded-medium border border-critical-200/50">
          <p className="text-xs text-text-secondary leading-relaxed">
            The AI engine encountered repeated schema compliance or network errors and could not generate a safe recommendation.
          </p>
          {brief.validationErrors.length > 0 && (
            <div className="mt-2 text-[10px] font-mono text-critical-700 dark:text-critical-300">
              <strong>Errors:</strong> {brief.validationErrors.join('; ')}
            </div>
          )}
        </div>
        <div className="text-[10px] text-text-muted font-mono">
          Generated at: {new Date(brief.generatedAt).toLocaleTimeString()}
        </div>
      </article>
    );
  }

  const targetAudience = audienceOverride || 'operations';
  const isFan = targetAudience === 'fan';
  const isVolunteer = targetAudience === 'volunteer';

  // Map backend urgency values to semantic visual frames & badges
  const urgencyConfig = {
    low: {
      border: 'border-l-4 border-l-neutral-400 border-border-color',
      icon: Info,
      iconColor: 'text-neutral-500',
      badgeVariant: 'neutral' as const,
    },
    moderate: {
      border: 'border-l-4 border-l-primary-500 border-border-color',
      icon: Info,
      iconColor: 'text-primary-500',
      badgeVariant: 'normal' as const,
    },
    high: {
      border: 'border-l-4 border-l-warning-500 border-border-color',
      icon: AlertTriangle,
      iconColor: 'text-warning-500',
      badgeVariant: 'warning' as const,
    },
    critical: {
      border: 'border-l-4 border-l-critical-600 border-border-color',
      icon: AlertOctagon,
      iconColor: 'text-critical-600',
      badgeVariant: 'critical' as const,
    },
  };

  const currentUrgency = brief.urgency || 'low';
  const config = urgencyConfig[currentUrgency];

  // Helper to map entities to categories for EvidenceChip rendering
  const getEvidenceCategory = (evidenceStr: string): string => {
    const lower = evidenceStr.toLowerCase();
    if (lower.includes('gate')) return 'gates';
    if (lower.includes('rain') || lower.includes('weather') || lower.includes('temperature')) return 'weather';
    if (lower.includes('incident') || lower.includes('surge') || lower.includes('fire')) return 'incidents';
    if (lower.includes('volunteer') || lower.includes('staff')) return 'volunteers';
    if (lower.includes('medic') || lower.includes('ambulance') || lower.includes('medical')) return 'medical';
    if (lower.includes('elevator') || lower.includes('escalator') || lower.includes('shuttle')) return 'transport';
    return 'gates'; // fallback
  };

  return (
    <article
      className={`rounded-medium border shadow-low transition-all duration-medium overflow-hidden ${config.border} bg-bg-card ${className}`}
    >
      {/* Collapsed Header Portion */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <IconWrapper icon={config.icon} size="md" className={config.iconColor} />
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-text-primary">
                AI Recommendation Brief
              </h2>
              <Badge variant={config.badgeVariant} className="capitalize">
                {currentUrgency}
              </Badge>
            </div>
          </div>
          {/* Confidence Indicator */}
          {!isVolunteer && (
            <ConfidenceBadge
              confidence={{
                percentage: brief.confidence.score,
                label: `${brief.confidence.tier} confidence`,
              }}
              showBar={!isFan}
              className={isFan ? 'opacity-80 scale-95' : ''}
            />
          )}
        </div>

        {/* 3. Contradiction Warning */}
        {brief.contradictionWarning && (
          <div className="p-2.5 bg-warning-50/30 dark:bg-warning-900/10 border border-warning-200/50 rounded-medium flex gap-2 items-start">
            <IconWrapper icon={AlertTriangle} size="sm" className="text-warning-600 mt-0.5 shrink-0" />
            <div className="text-[10px] text-text-secondary leading-relaxed">
              <strong>Consistency Warning:</strong> {brief.contradictionWarning}
            </div>
          </div>
        )}

        {/* Core Recommendation Callout */}
        <div className="p-3 bg-bg-secondary rounded-medium border border-border-color/50">
          <p className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-1 text-primary-600 dark:text-primary-400">
            {isFan ? 'Recommended Action' : 'Recommendation'}
          </p>
          <p className="text-sm text-text-primary leading-relaxed font-semibold">
            {brief.recommendation}
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center gap-4 mt-1">
          <span className="text-[10px] text-text-muted font-mono">
            {new Date(brief.generatedAt).toLocaleTimeString()}
          </span>
          <div className="flex gap-2">
            {!isFan && onShowHistory && (
              <Button
                variant="ghost"
                size="sm"
                className="text-text-muted hover:text-text-primary gap-1"
                onClick={onShowHistory}
              >
                <IconWrapper icon={History} size="sm" />
                <span className="text-[11px]">History</span>
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1 h-7 px-2.5 text-[11px]"
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
          ${isExpanded ? 'max-h-[1200px] opacity-100 p-4 space-y-4' : 'max-h-0 opacity-0 pointer-events-none'}`}
      >
        {/* Situation summary / Reasoning Chain */}
        {brief.reasoning && (
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              AI Reasoning & Analysis
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed bg-bg-secondary p-3 rounded-medium border border-border-color/30">
              {brief.reasoning}
            </p>
          </div>
        )}

        {/* Evidence aggregation */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Supporting Evidence
          </h4>
          <div className="flex flex-wrap gap-2">
            {brief.evidence.map((ev, i) => (
              <EvidenceChip key={i} label={ev} category={getEvidenceCategory(ev)} />
            ))}
          </div>
        </div>

        {/* Suggested Actions List */}
        {brief.suggestedActions.length > 0 && (
          <div className="space-y-2 border-t border-border-color/50 pt-3">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Suggested Action Steps
            </h4>
            <ol className="space-y-2 list-decimal list-inside pl-1">
              {brief.suggestedActions.map((action, i) => (
                <li key={i} className="text-xs text-text-primary leading-relaxed font-medium">
                  <span className="text-text-secondary ml-1">{action}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 4. Confidence Breakdown Expandable Detail Section */}
        {!isFan && brief.confidence.breakdown.length > 0 && (
          <div className="space-y-2 border-t border-border-color/50 pt-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Confidence Breakdown
              </h4>
              <button
                onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
                className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                {showConfidenceDetails ? 'Hide Factors' : 'Explain Score'}
              </button>
            </div>

            {showConfidenceDetails && (
              <div className="bg-bg-secondary border border-border-color/30 rounded-medium p-2.5 space-y-1.5 font-mono text-[10px]">
                {brief.confidence.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-4">
                    <span className="text-text-secondary">
                      • {item.reason}
                    </span>
                    <span className={`font-semibold shrink-0 ${item.impact >= 0 ? 'text-secondary-600' : 'text-critical-600'}`}>
                      {item.impact >= 0 ? `+${item.impact}` : item.impact} pts
                    </span>
                  </div>
                ))}
                <div className="border-t border-border-color/50 pt-1.5 mt-1.5 flex justify-between font-semibold text-text-primary text-[11px]">
                  <span>Final Reliability Score</span>
                  <span>{brief.confidence.score} / 100</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Evidence warnings */}
        {brief.evidenceWarnings.length > 0 && !isFan && (
          <div className="pt-2 border-t border-border-color/30">
            <div className="text-[9px] text-text-muted font-mono">
              <strong>Grounding warnings (for developers/judges):</strong>
              <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                {brief.evidenceWarnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
