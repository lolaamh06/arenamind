'use client';

import React, { useMemo } from 'react';
import { useStadiumState } from '../../../../context/StadiumStateContext';
import { DashboardLayout } from '../../../../components/organisms/DashboardLayout';
import { OperationsSidebar } from '../../../../components/organisms/OperationsSidebar';
import { Badge } from '../../../../components/atoms/Badge';
import { Sparkles } from 'lucide-react';
import { IconWrapper } from '../../../../components/atoms/IconWrapper';

export default function OperationsInsights() {
  const { decisionHistory } = useStadiumState();

  // Compute stats
  const stats = useMemo(() => {
    const total = decisionHistory.length;
    if (total === 0) {
      return {
        total: 0,
        avgConfidence: 0,
        urgencyCount: { critical: 0, high: 0, moderate: 0, low: 0, unknown: 0 },
        warningCount: 0,
        contradictionCount: 0,
      };
    }

    let confidenceSum = 0;
    let warningCount = 0;
    let contradictionCount = 0;
    const urgencyCount = { critical: 0, high: 0, moderate: 0, low: 0, unknown: 0 };

    decisionHistory.forEach((brief) => {
      confidenceSum += brief.confidence.score;
      warningCount += (brief.evidenceWarnings?.length || 0) + (brief.validationErrors?.length || 0);
      if (brief.contradictionWarning) {
        contradictionCount += 1;
      }
      
      const urgency = brief.urgency || 'unknown';
      if (urgency in urgencyCount) {
        urgencyCount[urgency as keyof typeof urgencyCount] += 1;
      } else {
        urgencyCount.unknown += 1;
      }
    });

    return {
      total,
      avgConfidence: Math.round(confidenceSum / total),
      urgencyCount,
      warningCount,
      contradictionCount,
    };
  }, [decisionHistory]);

  return (
    <DashboardLayout sidebar={<OperationsSidebar />}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
          AI Insights & Analytics
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Decision pipeline health metrics and operational operator trust guidance.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Pipeline Stats & Health */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Total Decisions</span>
              <span className="text-2xl font-black text-zinc-200 block mt-1">{stats.total}</span>
            </div>
            <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Avg Confidence</span>
              <span className="text-2xl font-black text-zinc-200 block mt-1">{stats.avgConfidence}%</span>
            </div>
            <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Friction Warnings</span>
              <span className="text-2xl font-black text-zinc-200 block mt-1">{stats.warningCount}</span>
            </div>
            <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Contradictions</span>
              <span className="text-2xl font-black text-zinc-200 block mt-1">{stats.contradictionCount}</span>
            </div>
          </div>

          {/* Urgency Distribution */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Recommendation Urgency Distribution
            </h2>

            {stats.total === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No decision briefs generated in this session. Trigger a scenario to see distribution data.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-zinc-950/40 border border-zinc-800/40 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-critical-400">Critical</span>
                  <div className="text-2xl font-bold mt-1">{stats.urgencyCount.critical}</div>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Immediate dispatch</span>
                </div>
                <div className="p-4 bg-zinc-950/40 border border-zinc-800/40 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-warning-400">High</span>
                  <div className="text-2xl font-bold mt-1">{stats.urgencyCount.high}</div>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Urgent mitigation</span>
                </div>
                <div className="p-4 bg-zinc-950/40 border border-zinc-800/40 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary-400">Moderate</span>
                  <div className="text-2xl font-bold mt-1">{stats.urgencyCount.moderate}</div>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Active monitoring</span>
                </div>
                <div className="p-4 bg-zinc-950/40 border border-zinc-800/40 rounded-2xl">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Low</span>
                  <div className="text-2xl font-bold mt-1">{stats.urgencyCount.low}</div>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">Default baseline</span>
                </div>
              </div>
            )}
          </div>

          {/* Operational Advisory & Safety Checkpoints */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Pipeline Anomaly Log
            </h2>
            <div className="space-y-3">
              {decisionHistory.filter(b => b.contradictionWarning || b.validationErrors?.length || b.evidenceWarnings?.length).slice(0, 3).map((brief, idx) => (
                <div key={idx} className="p-3 bg-zinc-950/40 border border-zinc-800/40 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-zinc-300">Brief ID: {brief.id}</div>
                    <p className="text-[10px] text-zinc-500 mt-1 max-w-lg truncate">
                      {brief.contradictionWarning || brief.validationErrors?.[0] || brief.evidenceWarnings?.[0]}
                    </p>
                  </div>
                  <Badge variant="warning">Anomaly Flagged</Badge>
                </div>
              ))}
              {decisionHistory.filter(b => b.contradictionWarning || b.validationErrors?.length || b.evidenceWarnings?.length).length === 0 && (
                <div className="text-center py-4 text-zinc-500 text-xs">
                  No anomalous data or logical contradictions flagged by the validator.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Trust & Operator Action Guidelines */}
        <div className="space-y-6">
          
          {/* Operator trust card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-primary-950/20 to-zinc-900/60 border border-primary-900/30 text-zinc-100 space-y-4">
            <div className="h-10 w-10 rounded-2xl bg-primary-900/30 text-primary-400 flex items-center justify-center">
              <IconWrapper icon={Sparkles} size="sm" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">Confidence Interpretation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Confidence scores indicate how well the AI recommendation is supported by the Digital Twin model context:
            </p>
            <ul className="space-y-3.5 text-xs text-zinc-300 pt-2 font-sans">
              <li className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <div>
                  <span className="font-bold text-zinc-200">High Confidence (&gt;80%)</span>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                    Recommendation matches all internal validation constraints and is strongly grounded in recent weather, gate flow, and staff levels.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-warning-500 shrink-0 mt-1.5" />
                <div>
                  <span className="font-bold text-zinc-200">Moderate Confidence (50-80%)</span>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                    Decision relies on minor assumptions or utilizes missing fields that have default fallbacks applied. Proceed with normal precautions.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-critical-500 shrink-0 mt-1.5" />
                <div>
                  <span className="font-bold text-zinc-200">Low Confidence (&lt;50%)</span>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                    Pipeline detected potential logical contradictions or data anomalies (e.g. conflicting telemetry reports). Human verification is highly recommended.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Help & Support Card */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Operator Duty Support</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              If the pipeline consistently flags data contradictions, verify physical gateway sensor status or request manual global scans.
            </p>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
