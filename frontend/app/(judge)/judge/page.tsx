'use client';

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

import React, { useEffect, useState, useMemo } from 'react';
import { useStadiumState } from '../../../context/StadiumStateContext';
import { DecisionBrief } from '../../../components/organisms/DecisionBrief';
import { api } from '../../../lib/api-client';
import { PipelineExplainer } from '../../../components/organisms/PipelineExplainer';
import { DecisionBrief as ApiDecisionBrief, Gate, AccessibilityAsset } from '../../../types';
import {
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ArrowUpDown,
  History,
  Layers,
  Sliders,
  AlertOctagon,
  Info
} from 'lucide-react';
import { IconWrapper } from '../../../components/atoms/IconWrapper';
import { Badge } from '../../../components/atoms/Badge';

export default function JudgeDashboard() {
  const {
    decisionHistory,
    isLoadingHistory,
    loadHistory,
    isLoadingContext,
    isTriggeringScenario
  } = useStadiumState();

  const [selectedBrief, setSelectedBrief] = useState<ApiDecisionBrief | null>(null);
  const [referenceHistory, setReferenceHistory] = useState<ApiDecisionBrief[]>([]);
  const [isLoadingRefHistory, setIsLoadingRefHistory] = useState(false);

  // Filter & Sort States
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterValidity, setFilterValidity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'confidence'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Trigger history load on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Fetch reference history when a brief is selected
  useEffect(() => {
    if (!selectedBrief) {
      setReferenceHistory([]);
      return;
    }
    const fetchRefHistory = async () => {
      setIsLoadingRefHistory(true);
      try {
        const res = await api.getDecisionsByReference(selectedBrief.trigger.reference);
        // Exclude the current selected brief itself to show others
        const filtered = res.briefs.filter((b) => b.id !== selectedBrief.id);
        setReferenceHistory(filtered);
      } catch (err) {
        console.error('Failed to fetch reference history:', err);
      } finally {
        setIsLoadingRefHistory(false);
      }
    };
    fetchRefHistory();
  }, [selectedBrief]);

  // Aggregate Stats Strip
  const stats = useMemo(() => {
    const total = decisionHistory.length;
    if (total === 0) {
      return { total: 0, avgConfidence: 0, criticalCount: 0, contradictionCount: 0 };
    }

    let totalConfidence = 0;
    let criticalCount = 0;
    let contradictionCount = 0;

    decisionHistory.forEach((b) => {
      totalConfidence += b.confidence.score;
      if (b.urgency === 'critical') criticalCount++;
      if (b.contradictionWarning) contradictionCount++;
    });

    return {
      total,
      avgConfidence: Math.round(totalConfidence / total),
      criticalCount,
      contradictionCount
    };
  }, [decisionHistory]);

  // Filtered & Sorted History
  const filteredHistory = useMemo(() => {
    let result = [...decisionHistory];

    if (filterUrgency !== 'all') {
      result = result.filter((b) => b.urgency === filterUrgency);
    }

    if (filterValidity !== 'all') {
      const wantValid = filterValidity === 'valid';
      result = result.filter((b) => b.isValid === wantValid);
    }

    result.sort((a, b) => {
      if (sortBy === 'timestamp') {
        const timeA = new Date(a.generatedAt).getTime();
        const timeB = new Date(b.generatedAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      } else {
        const confA = a.confidence.score;
        const confB = b.confidence.score;
        return sortOrder === 'desc' ? confB - confA : confA - confB;
      }
    });

    return result;
  }, [decisionHistory, filterUrgency, filterValidity, sortBy, sortOrder]);

  const toggleSort = (field: 'timestamp' | 'confidence') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* A. Header */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center select-none">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-blue-400 uppercase">
              AI Reasoning Explainability Center
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Full transparency into ArenaMind&apos;s AI reasoning pipeline. Inspect confidence weights, contradiction checks, and prompt telemetry.
            </p>
          </div>
          {(isLoadingHistory || isLoadingContext || isTriggeringScenario) && (
            <div className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold font-mono animate-pulse">
              <IconWrapper icon={RefreshCw} size="sm" className="animate-spin" />
              <span>Syncing telemetry...</span>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Explanation (Always Present) */}
      <PipelineExplainer />

      {/* Live Example Callout Transition */}
      <div className="border-t border-zinc-800 pt-6 select-none">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
            Live Telemetry Verification
          </h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          The pipeline description above explains the general architecture of the system. 
          Below, you can inspect real decisions generated by the live system in this session.
        </p>

        {decisionHistory.length === 0 ? (
          <div className="p-6 bg-zinc-900 border border-zinc-800 border-dashed rounded-medium text-center space-y-2">
            <Info className="w-8 h-8 text-blue-500 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-300">No decisions generated yet in this session</h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
              Start by going to the <a href="/operations" className="text-blue-400 hover:underline font-bold">Operations Portal</a> and triggering a scenario (e.g. Heavy Rain, Crowd Surge) to generate actual decision telemetry, grounding context, prompts, and raw Gemini outputs.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* B. System Summary Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-medium shadow-low flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Decisions</span>
                <span className="text-2xl font-black text-zinc-100">{stats.total}</span>
              </div>
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-medium shadow-low flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Avg Confidence</span>
                <span className="text-2xl font-black text-blue-400">{stats.avgConfidence}%</span>
              </div>
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-medium shadow-low flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Critical Decisions</span>
                <span className="text-2xl font-black text-critical-500">{stats.criticalCount}</span>
              </div>
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-medium shadow-low flex flex-col gap-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Contradictions Flagged</span>
                <span className={`text-2xl font-black ${stats.contradictionCount > 0 ? 'text-warning-500' : 'text-zinc-500'}`}>
                  {stats.contradictionCount}
                </span>
              </div>
            </div>

            {/* Main Grid: Left is history table, Right is deep dive walkthrough */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* C. Decision History Table (xl:col-span-5) */}
              <section className="xl:col-span-5 bg-zinc-900 border border-zinc-800 rounded-medium p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-blue-500" />
                    Decision Pipeline Log
                  </h2>
                  <button
                    onClick={() => loadHistory()}
                    className="text-[10px] text-blue-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Reload
                  </button>
                </div>

                {/* Filters controls */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">Urgency</label>
                    <select
                      value={filterUrgency}
                      onChange={(e) => setFilterUrgency(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded px-2 py-1.5"
                    >
                      <option value="all">All Urgency</option>
                      <option value="critical">Critical Only</option>
                      <option value="high">High Only</option>
                      <option value="moderate">Moderate Only</option>
                      <option value="low">Low Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">Status</label>
                    <select
                      value={filterValidity}
                      onChange={(e) => setFilterValidity(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 rounded px-2 py-1.5"
                    >
                      <option value="all">All Outcomes</option>
                      <option value="valid">Valid Recommendations</option>
                      <option value="invalid">Validation Failures</option>
                    </select>
                  </div>
                </div>

                {/* Table container */}
                <div className="border border-zinc-800 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950/80 text-[10px] text-zinc-500 uppercase font-bold border-b border-zinc-800">
                        <th
                          className="p-2.5 cursor-pointer hover:text-zinc-300 transition-colors"
                          onClick={() => toggleSort('timestamp')}
                        >
                          <span className="flex items-center gap-1">
                            Time
                            <ArrowUpDown className="w-2.5 h-2.5" />
                          </span>
                        </th>
                        <th className="p-2.5">Scope</th>
                        <th
                          className="p-2.5 cursor-pointer hover:text-zinc-300 transition-colors text-right"
                          onClick={() => toggleSort('confidence')}
                        >
                          <span className="flex items-center gap-1 justify-end">
                            Conf
                            <ArrowUpDown className="w-2.5 h-2.5" />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-xs">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-zinc-600">
                            {decisionHistory.length === 0
                              ? 'No decisions generated in this session yet.'
                              : 'No decisions match the selected filters.'}
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((b) => {
                          const isSelected = selectedBrief?.id === b.id;
                          const date = new Date(b.generatedAt);
                          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                          return (
                            <tr
                              key={b.id}
                              onClick={() => setSelectedBrief(b)}
                              className={`cursor-pointer transition-all duration-fast
                                ${isSelected ? 'bg-blue-950/20 border-l-2 border-l-blue-500' : 'hover:bg-zinc-800/40'}`}
                            >
                              <td className="p-2.5 font-mono text-[11px] text-zinc-400">
                                {timeStr}
                              </td>
                              <td className="p-2.5">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-semibold text-zinc-200 capitalize">
                                    {b.trigger.reference.replace('gate-', 'Gate ').replace('inc-', 'Incident ')}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 font-mono">
                                    {b.trigger.triggerType === 'scenario-mutation'
                                      ? 'Scenario'
                                      : b.trigger.triggerType === 'manual-request'
                                        ? 'Manual Query'
                                        : 'Periodic'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-2.5 text-right">
                                <div className="flex flex-col items-end gap-1">
                                  {!b.isValid ? (
                                    <Badge variant="critical">Failed</Badge>
                                  ) : (
                                    <span className={`font-mono font-bold ${
                                      b.confidence.tier === 'high'
                                        ? 'text-primary-500'
                                        : b.confidence.tier === 'moderate'
                                          ? 'text-warning-500'
                                          : 'text-critical-500'
                                    }`}>
                                      {b.confidence.score}%
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* D. Decision Deep Dive & Walkthrough (xl:col-span-7) */}
              <section className="xl:col-span-7 space-y-6">
                {!selectedBrief ? (
                  <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-medium p-12 text-center text-zinc-500 flex flex-col items-center justify-center min-h-[400px]">
                    <Layers className="w-12 h-12 text-zinc-700 mb-3" />
                    <h3 className="font-semibold text-sm text-zinc-400">No Decision Selected</h3>
                    <p className="text-xs text-zinc-600 mt-1 max-w-sm">
                      Select any decision from the pipeline log table on the left to inspect its complete AI reasoning lifecycle, confidence breakdown, and prompts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary of Selected Brief Header */}
                    <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-medium">
                      <div>
                        <span className="text-[9px] font-bold font-mono tracking-widest text-blue-400 uppercase">
                          Currently Inspecting
                        </span>
                        <h3 className="text-sm font-bold text-zinc-200 mt-0.5 font-mono">
                          ID: {selectedBrief.id.substring(0, 8)}... ({selectedBrief.trigger.reference})
                        </h3>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          Reasoning generated at {new Date(selectedBrief.generatedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={selectedBrief.isValid ? 'resolved' : 'critical'}>
                        {selectedBrief.isValid ? 'Schema Compliance Passed' : 'Schema Compliance Failed'}
                      </Badge>
                    </div>

                    {/* 5.A. Final Brief (Render exactly as operations saw it) */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        A. Operations View Render
                      </h4>
                      <DecisionBrief brief={selectedBrief} audienceOverride="operations" />
                    </div>

                    {/* 5.B. Confidence Explainer */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-medium p-5 space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                        <Sliders className="w-4 h-4 text-blue-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                          B. Confidence Score Explainer
                        </h4>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-center p-3 bg-zinc-950 border border-zinc-800 rounded-medium min-w-[80px]">
                          <div className="text-2xl font-black text-blue-400 font-mono">
                            {selectedBrief.confidence.score}%
                          </div>
                          <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mt-0.5">
                            {selectedBrief.confidence.tier}
                          </div>
                        </div>
                        <div className="text-xs text-zinc-400 leading-relaxed">
                          The Confidence Engine computes reliability based on data grounding checks, prompt retries, and formatting integrity. A baseline of 100% is impacted by penalties.
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                          Score Calculations Breakdown
                        </span>
                        <div className="space-y-2 divide-y divide-zinc-800/50">
                          {selectedBrief.confidence.breakdown.map((f, i) => (
                            <div key={i} className="pt-2 flex justify-between gap-4 text-xs">
                              <div className="space-y-0.5">
                                <span className="font-semibold text-zinc-300 font-mono text-[11px]">{f.factor}</span>
                                <p className="text-[10px] text-zinc-500">{f.reason}</p>
                              </div>
                              <span className={`font-mono font-bold ${f.impact < 0 ? 'text-critical-500' : 'text-primary-500'}`}>
                                {f.impact > 0 ? `+${f.impact}` : f.impact}%
                              </span>
                            </div>
                          ))}
                          {selectedBrief.isValid && selectedBrief.evidenceWarnings.length === 0 && (
                            <div className="pt-2 flex gap-2 text-xs text-primary-500 font-semibold items-center">
                              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>No evidence warnings — every cited fact was grounded in live signal data.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 5.C. Contradiction Status */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-medium p-5 space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                        <AlertOctagon className="w-4 h-4 text-blue-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                          C. Contradiction Checking & History Memory
                        </h4>
                      </div>

                      {selectedBrief.contradictionWarning ? (
                        <div className="p-3.5 bg-warning-950/20 border border-warning-900/50 rounded-medium flex gap-2.5">
                          <IconWrapper icon={AlertTriangle} size="sm" className="text-warning-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-warning-400 uppercase tracking-wider">
                              Contradiction Warning Triggered
                            </span>
                            <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                              {selectedBrief.contradictionWarning}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-medium flex gap-2.5 items-center text-zinc-400">
                          <CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
                          <span className="text-xs">No active contradictions found with recent decisions.</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                          Decision Memory Checks for reference: &quot;{selectedBrief.trigger.reference}&quot;
                        </span>
                        {isLoadingRefHistory ? (
                          <div className="text-xs text-zinc-600 animate-pulse py-2">Querying Decision Memory...</div>
                        ) : referenceHistory.length === 0 ? (
                          <div className="text-xs text-zinc-600 py-1">No other decisions for this scope exist in history.</div>
                        ) : (
                          <div className="space-y-1.5">
                            {referenceHistory.map((h) => (
                              <div key={h.id} className="text-[11px] bg-zinc-950 border border-zinc-800/80 rounded px-2.5 py-1.5 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-zinc-500">#{h.id.substring(0, 6)}</span>
                                  <span className="text-zinc-300 capitalize">{h.trigger.triggerType.replace('-', ' ')}</span>
                                </div>
                                <span className="text-zinc-500 text-[10px]">
                                  {new Date(h.generatedAt).toLocaleTimeString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 5.D. Pipeline Walkthrough */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-medium p-5 space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                        <Layers className="w-4 h-4 text-blue-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                          D. Reasoning Pipeline Steps Walkthrough
                        </h4>
                      </div>

                      <div className="relative border-l-2 border-zinc-800 pl-4 ml-2 space-y-6">
                        {/* Step 1: Context Snapshot */}
                        <div className="space-y-2 relative">
                          <div className="absolute -left-[23px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-zinc-900" />
                          <h5 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                            1. Context Engine Snapshot
                          </h5>
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Captured raw Stadium Twin telemetry including gate volumes, weather logs, active incident lists, and accessibility asset maps at decision time.
                          </p>
                        </div>

                        {/* Step 2: Signal Filtering */}
                        <div className="space-y-2 relative">
                          <div className="absolute -left-[23px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-zinc-900" />
                          <h5 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                            2. Signal Filter (RelevantSignals)
                          </h5>
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Filtered and compressed the full snapshot down to relevant tokens to avoid context noise and focus the LLM attention window.
                          </p>
                          {selectedBrief.signals ? (
                            <div className="bg-zinc-950 border border-zinc-800/80 rounded p-3 font-mono text-[10px] overflow-x-auto max-h-48 overflow-y-auto text-zinc-400">
                              <span className="text-[9px] text-zinc-600 block mb-1 uppercase font-bold">Grounding context scope</span>
                              {JSON.stringify(
                                {
                                  trigger: selectedBrief.signals.trigger,
                                  gates: selectedBrief.signals.gates.map((g: Gate) => ({
                                    id: g.id,
                                    displayName: g.displayName,
                                    occupancyPercent: g.occupancyPercent,
                                    riskLevel: g.riskLevel
                                  })),
                                  weather: selectedBrief.signals.weather,
                                  incidents: selectedBrief.signals.incidents,
                                  accessibilityAssets: selectedBrief.signals.accessibilityAssets?.map((a: AccessibilityAsset) => ({
                                    id: a.id,
                                    assetType: a.assetType,
                                    status: a.status
                                  }))
                                },
                                null,
                                2
                              )}
                            </div>
                          ) : (
                            <div className="text-[11px] text-zinc-600 italic">Context signals metadata was omitted or unavailable for this item.</div>
                          )}
                        </div>

                        {/* Step 3: Prompt Sent to Gemini */}
                        <div className="space-y-2 relative">
                          <div className="absolute -left-[23px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-zinc-900" />
                          <h5 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                            3. Prompt Construction & Gemini API Request
                          </h5>
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Formatted the RelevantSignals into structural XML blocks and combined them with the strict validation system prompt.
                          </p>
                          {selectedBrief.prompt ? (
                            <div className="bg-zinc-950 border border-zinc-800/80 rounded p-3 font-mono text-[10px] overflow-x-auto max-h-48 overflow-y-auto text-zinc-400 whitespace-pre-wrap leading-relaxed">
                              {selectedBrief.prompt}
                            </div>
                          ) : (
                            <div className="text-[11px] text-zinc-600 italic">Prompt payload was not recorded for this decision.</div>
                          )}
                        </div>

                        {/* Step 4: Raw Gemini Response */}
                        <div className="space-y-2 relative">
                          <div className="absolute -left-[23px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-zinc-900" />
                          <h5 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                            4. Raw LLM Response Telemetry
                          </h5>
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Captured the raw text string response returned from the Gemini API.
                          </p>
                          {selectedBrief.rawResponse ? (
                            <div className="bg-zinc-950 border border-zinc-800/80 rounded p-3 font-mono text-[10px] overflow-x-auto max-h-48 overflow-y-auto text-zinc-400 whitespace-pre-wrap">
                              {selectedBrief.rawResponse}
                            </div>
                          ) : (
                            <div className="text-[11px] text-zinc-600 italic">Raw response was not stored for this decision.</div>
                          )}
                        </div>

                        {/* Step 5: Validation */}
                        <div className="space-y-2 relative">
                          <div className="absolute -left-[23px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-zinc-900" />
                          <h5 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                            5. Output Validator Inspection
                          </h5>
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Ran schema alignment checks, structural parsing checks, and verified the cited evidence was strictly grounded.
                          </p>
                          <div className="bg-zinc-950 border border-zinc-800/80 rounded p-3 font-mono text-[10px] text-zinc-400 space-y-1.5">
                            <div>
                              <strong>Schema Validation:</strong>{' '}
                              {selectedBrief.isValid ? (
                                <span className="text-primary-500">PASSED</span>
                              ) : (
                                <span className="text-critical-500">FAILED</span>
                              )}
                            </div>
                            {selectedBrief.validationErrors.length > 0 && (
                              <div className="text-critical-500">
                                <strong>Errors:</strong> {selectedBrief.validationErrors.join('; ')}
                              </div>
                            )}
                            <div>
                              <strong>Evidence Grounding Alerts:</strong>{' '}
                              {selectedBrief.evidenceWarnings.length > 0 ? (
                                <span className="text-warning-500 font-bold">
                                  {selectedBrief.evidenceWarnings.length} Warnings raised
                                </span>
                              ) : (
                                <span className="text-primary-500 font-semibold">0 Warnings (Grounding clean)</span>
                              )}
                            </div>
                            {selectedBrief.evidenceWarnings.map((w, idx) => (
                              <div key={idx} className="text-warning-500 text-[9px] pl-2">
                                • {w}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Step 6: Confidence Scoring */}
                        <div className="space-y-2 relative">
                          <div className="absolute -left-[23px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-zinc-900" />
                          <h5 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                            6. Confidence Scoring Matrix
                          </h5>
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Evaluated penalty deductions to arrive at the final confidence tier. (See panel B above).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
