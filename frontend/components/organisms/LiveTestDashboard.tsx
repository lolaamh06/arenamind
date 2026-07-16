'use client';

import React from 'react';
import { useStadiumState } from '../../context/StadiumStateContext';
import { Button } from '../../components/atoms/Button';
import { StatCard } from '../../components/molecules/StatCard';
import { DecisionBrief } from '../../components/organisms/DecisionBrief';
import { AlertTriangle, Cloud, DoorOpen } from 'lucide-react';

export default function LiveTestDashboard() {
  const {
    stadiumContext,
    currentDecisionBrief,
    isLoadingContext,
    isTriggeringScenario,
    isGeneratingDecision,
    error,
    resetContext,
    triggerScenario,
    requestDecision,
    clearError,
  } = useStadiumState();

  const handleScenario = async (name: 'heavy-rain' | 'crowd-surge' | 'medical-incident') => {
    await triggerScenario(name);
  };

  const handleManualRequest = async (gateId: string) => {
    await requestDecision('manual-request', gateId, `Manual operator check on ${gateId}`);
  };

  const metadata = stadiumContext?.metadata;
  const gates = stadiumContext?.gates || [];
  const weather = stadiumContext?.weather;
  const incidents = stadiumContext?.incidents || [];

  return (
    <div className="space-y-8 p-6 bg-bg-secondary/30 border border-border-color rounded-medium max-w-4xl mx-auto my-8">
      {/* Header */}
      <div className="border-b border-border-color pb-4">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">
          Live Backend Wiring Test Panel
        </h2>
        <p className="text-xs text-text-muted mt-1 font-mono">
          [TEMPORARY - FOR PHASE 4A VERIFICATION, TO BE REPLACED BY PORTAL VIEWS IN PHASE 4B]
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 bg-critical-50/20 dark:bg-critical-900/10 border border-critical-200/50 rounded-medium flex justify-between items-start gap-4">
          <div className="flex gap-2">
            <AlertTriangle className="text-critical-600 shrink-0 w-4 h-4 mt-0.5" />
            <p className="text-xs text-text-primary">{error}</p>
          </div>
          <button onClick={clearError} className="text-[10px] text-text-muted hover:text-text-primary underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Scenario Triggers & Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Mutations & Triggers
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleScenario('heavy-rain')}
            isLoading={isTriggeringScenario}
            disabled={isLoadingContext}
          >
            Trigger Heavy Rain
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleScenario('crowd-surge')}
            isLoading={isTriggeringScenario}
            disabled={isLoadingContext}
          >
            Trigger Crowd Surge (Gate D)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleScenario('medical-incident')}
            isLoading={isTriggeringScenario}
            disabled={isLoadingContext}
          >
            Trigger Medical Emergency (Gate C)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={resetContext}
            isLoading={isLoadingContext}
            disabled={isTriggeringScenario}
          >
            Reset Stadium Twin
          </Button>
        </div>
      </div>

      {/* Manual Request Triggers */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Manual Decisions by Gate
        </h3>
        <div className="flex flex-wrap gap-2">
          {gates.map((g) => (
            <Button
              key={g.id}
              variant="ghost"
              size="sm"
              className="border border-border-color hover:bg-bg-secondary h-8 px-2.5 text-[11px]"
              onClick={() => handleManualRequest(g.id)}
              disabled={isGeneratingDecision || isTriggeringScenario || isLoadingContext}
            >
              Check {g.displayName.split('—')[0].trim()}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="border border-border-color hover:bg-bg-secondary h-8 px-2.5 text-[11px] font-bold"
            onClick={() => requestDecision('periodic-scan', 'global', 'Manual Periodic Scan trigger')}
            disabled={isGeneratingDecision || isTriggeringScenario || isLoadingContext}
          >
            Scan All (Global)
          </Button>
        </div>
      </div>

      {/* Context Twin Stats Panel */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Stadium Twin Status
        </h3>
        {isLoadingContext ? (
          <div className="h-24 flex items-center justify-center text-xs text-text-muted animate-pulse">
            Syncing Digital Twin...
          </div>
        ) : stadiumContext ? (
          <div className="space-y-4">
            {/* Meta Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <StatCard
                label="Match State"
                value={metadata?.matchPhase || 'Unknown'}
                trend="stable"
                trendLabel={`${metadata?.homeTeam} vs ${metadata?.awayTeam}`}
              />
              <StatCard
                label="Attendance"
                value={metadata?.currentAttendance?.toLocaleString() || '0'}
                trend="stable"
                trendLabel={`Capacity: ${metadata?.totalCapacity?.toLocaleString()}`}
              />
              <StatCard
                label="Active Weather"
                value={weather?.condition || 'Unknown'}
                trend="stable"
                trendLabel={`${weather?.temperatureCelsius}°C | Rain: ${weather?.rainIntensity}/10`}
                icon={Cloud}
              />
              <StatCard
                label="Open Incidents"
                value={`${incidents.filter(i => i.status !== 'resolved').length} Active`}
                trend={incidents.length > 0 ? 'up' : 'stable'}
                icon={AlertTriangle}
              />
            </div>

            {/* Gates Occupancy */}
            <div className="bg-bg-secondary/50 border border-border-color/50 rounded-medium p-3">
              <h4 className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5" />
                Gates Risk & Queue Wait Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {gates.map((g) => (
                  <div
                    key={g.id}
                    className="p-2 border border-border-color/30 rounded bg-bg-card flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-text-primary">
                        {g.displayName.split('—')[0].trim()}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1 rounded ${
                          g.riskLevel === 'critical'
                            ? 'bg-critical-500/20 text-critical-600'
                            : g.riskLevel === 'high'
                              ? 'bg-warning-500/20 text-warning-600'
                              : 'bg-secondary-500/20 text-secondary-600'
                        }`}
                      >
                        {g.riskLevel}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between items-end">
                      <span className="text-xs text-text-secondary">{g.occupancyPercent}% cap</span>
                      <span className="text-[10px] text-text-muted font-mono">~{g.queueEstimate} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border border-dashed rounded text-center text-xs text-text-muted">
            Stadium Twin Context is not connected or initialized.
          </div>
        )}
      </div>

      {/* Decision Brief Output Panel */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          AI Operational Decision Brief Output
        </h3>
        <DecisionBrief
          brief={currentDecisionBrief}
          isLoading={isGeneratingDecision || isTriggeringScenario}
        />
      </div>
    </div>
  );
}
