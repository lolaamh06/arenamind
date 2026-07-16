'use client';

import React, { useState } from 'react';
import { useStadiumState } from '../../../../context/StadiumStateContext';
import { DashboardLayout } from '../../../../components/organisms/DashboardLayout';
import { OperationsSidebar } from '../../../../components/organisms/OperationsSidebar';
import { DecisionBrief } from '../../../../components/organisms/DecisionBrief';
import { Badge } from '../../../../components/atoms/Badge';
import { Filter, ChevronDown, ChevronUp, Clock, FileText, RefreshCw } from 'lucide-react';
import { IconWrapper } from '../../../../components/atoms/IconWrapper';

export default function OperationsHistory() {
  const { decisionHistory, isLoadingHistory } = useStadiumState();
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');
  const [expandedBriefId, setExpandedBriefId] = useState<string | null>(null);

  // Filters logic
  const filteredHistory = decisionHistory.filter((brief) => {
    const urgencyMatch = urgencyFilter === 'all' || (brief.urgency || 'low') === urgencyFilter;
    const triggerMatch = triggerFilter === 'all' || brief.trigger.triggerType === triggerFilter;
    return urgencyMatch && triggerMatch;
  });

  const toggleExpand = (id: string) => {
    setExpandedBriefId(expandedBriefId === id ? null : id);
  };

  return (
    <DashboardLayout sidebar={<OperationsSidebar />}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
            Operational Decision Archive
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Full history of all AI decisions, pipeline scans, and scenario recommendation briefs.
          </p>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400">
            <IconWrapper icon={Filter} size="sm" />
            <span>Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-transparent border-none text-zinc-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-950 text-zinc-200">All Levels</option>
              <option value="critical" className="bg-zinc-950 text-zinc-200">Critical</option>
              <option value="high" className="bg-zinc-950 text-zinc-200">High</option>
              <option value="moderate" className="bg-zinc-950 text-zinc-200">Moderate</option>
              <option value="low" className="bg-zinc-950 text-zinc-200">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400">
            <IconWrapper icon={Filter} size="sm" />
            <span>Trigger Type:</span>
            <select
              value={triggerFilter}
              onChange={(e) => setTriggerFilter(e.target.value)}
              className="bg-transparent border-none text-zinc-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-950 text-zinc-200">All Triggers</option>
              <option value="scenario-mutation" className="bg-zinc-950 text-zinc-200">Scenario</option>
              <option value="manual-request" className="bg-zinc-950 text-zinc-200">Manual Check</option>
              <option value="periodic-scan" className="bg-zinc-950 text-zinc-200">Periodic Scan</option>
            </select>
          </div>
        </div>
      </div>

      {isLoadingHistory && decisionHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 select-none">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center gap-3 w-full max-w-sm text-center shadow-lg">
            <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">Loading Decision Archive</h3>
            <p className="text-xs text-zinc-500 max-w-[240px]">
              Querying historical audit databases...
            </p>
          </div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-zinc-800 bg-zinc-900/20 py-20">
          <div className="h-12 w-12 rounded-2xl bg-zinc-950/60 text-zinc-400 flex items-center justify-center mb-4 border border-zinc-850">
            <IconWrapper icon={FileText} size="md" />
          </div>
          <h3 className="text-sm font-bold text-zinc-200">No decision logs found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            There are no logs matching your current filters, or no decisions have been generated yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((brief) => {
            const isExpanded = expandedBriefId === brief.id;
            const isCritical = brief.urgency === 'critical';
            const isHigh = brief.urgency === 'high';

            return (
              <div
                key={brief.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/20 overflow-hidden transition-all hover:border-zinc-700"
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(brief.id)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-2xl shrink-0
                      ${isCritical || isHigh ? 'bg-critical-950/40 text-critical-400' : 'bg-zinc-950/60 text-zinc-400'}`}>
                      <IconWrapper icon={FileText} size="sm" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase">{brief.id}</span>
                        <Badge variant={isCritical || isHigh ? 'critical' : brief.urgency === 'moderate' ? 'warning' : 'neutral'}>
                          {brief.urgency || 'low'}
                        </Badge>
                        <Badge variant="primary" className="capitalize text-[10px]">
                          {brief.trigger.triggerType.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs font-bold text-zinc-200 truncate mt-1">
                        {brief.recommendation || 'No recommendation issued.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono text-[10px] text-zinc-500">
                    <div className="flex items-center gap-1">
                      <IconWrapper icon={Clock} size="sm" />
                      <span>{new Date(brief.generatedAt).toLocaleTimeString()}</span>
                    </div>
                    <IconWrapper icon={isExpanded ? ChevronUp : ChevronDown} size="sm" />
                  </div>
                </div>

                {/* Expanded container */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-zinc-800/60 pt-4 bg-zinc-950/30">
                    <DecisionBrief
                      brief={brief}
                      audienceOverride="operations"
                      className="border-none bg-transparent shadow-none p-0"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
