'use client';

import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { DecisionBrief } from '../../types';
import { translateDecisionBrief } from '../../lib/fan-language';
import { IconWrapper } from '../atoms/IconWrapper';

interface FanAdvisoryBannerProps {
  brief: DecisionBrief | null;
}

export const FanAdvisoryBanner: React.FC<FanAdvisoryBannerProps> = ({ brief }) => {
  // If there's no active brief or it's not valid, show reassuring baseline
  if (!brief || !brief.isValid || !brief.recommendation) {
    return (
      <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-medium flex items-start gap-3 shadow-sm select-none">
        <div className="h-6 w-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
          <Info className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wider">
            All Clear
          </h4>
          <p className="text-xs text-teal-900 dark:text-teal-300 font-medium mt-0.5 leading-relaxed">
            Operations are running smoothly. Entry lines at gates are standard. Enjoy the match!
          </p>
        </div>
      </div>
    );
  }

  // Soften urgency colors to feel helpful and informative rather than alarms
  const urgencyColors = {
    low: 'bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300',
    moderate: 'bg-primary-500/10 border-primary-500/20 text-primary-900 dark:text-primary-300',
    high: 'bg-warning-500/10 border-warning-500/20 text-warning-900 dark:text-warning-300',
    critical: 'bg-critical-500/10 border-critical-500/20 text-critical-900 dark:text-critical-300',
  };

  const currentUrgency = brief.urgency || 'low';
  const colorClasses = urgencyColors[currentUrgency];

  // Fan translation of the recommendation text
  const fanFriendlyMessage = translateDecisionBrief(brief);

  return (
    <div className={`p-4 border rounded-medium flex items-start gap-3 shadow-sm ${colorClasses}`}>
      <div className="h-6 w-6 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
        <IconWrapper
          icon={currentUrgency === 'critical' || currentUrgency === 'high' ? AlertTriangle : Info}
          size="sm"
          className="text-current"
        />
      </div>
      <div className="flex-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-current opacity-80">
          Advisory Action Alert
        </h4>
        <p className="text-xs font-semibold mt-0.5 leading-relaxed">
          {fanFriendlyMessage}
        </p>
      </div>
    </div>
  );
};
