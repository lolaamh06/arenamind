'use client';

import React, { useState } from 'react';
import { useStadiumState } from '../../../context/StadiumStateContext';
import { DashboardLayout } from '../../../components/organisms/DashboardLayout';
import { OperationsSidebar } from '../../../components/organisms/OperationsSidebar';
import { StadiumOverviewHeader } from '../../../components/organisms/StadiumOverviewHeader';
import { ScenarioControlPanel } from '../../../components/organisms/ScenarioControlPanel';
import { GateCard } from '../../../components/organisms/GateCard';
import { RecentDecisionsLog } from '../../../components/organisms/RecentDecisionsLog';
import { DecisionBrief } from '../../../components/organisms/DecisionBrief';
import { Button } from '../../../components/atoms/Button';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { IconWrapper } from '../../../components/atoms/IconWrapper';

import { DecisionBrief as ApiDecisionBrief } from '../../../types';

export default function OperationsOverview() {
  const {
    stadiumContext,
    currentDecisionBrief,
    decisionHistory,
    isLoadingContext,
    isTriggeringScenario,
    isGeneratingDecision,
    error,
    resetContext,
    triggerScenario,
    requestDecision,
    clearError,
  } = useStadiumState();

  const [activeBriefOverride, setActiveBriefOverride] = useState<ApiDecisionBrief | null>(null);
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);

  const handleScenario = async (name: 'heavy-rain' | 'crowd-surge' | 'medical-incident') => {
    setActiveBriefOverride(null);
    setSelectedGateId(null);
    await triggerScenario(name);
  };

  const handleReset = async () => {
    setActiveBriefOverride(null);
    setSelectedGateId(null);
    await resetContext();
  };

  const handleGateSelect = async (gateId: string) => {
    setSelectedGateId(gateId);
    setActiveBriefOverride(null);
    await requestDecision('manual-request', gateId, `Manual operator check on ${gateId}`);
  };

  const handleSelectHistoricalBrief = (brief: ApiDecisionBrief) => {
    setActiveBriefOverride(brief);
    if (brief.trigger.reference.startsWith('gate-')) {
      setSelectedGateId(brief.trigger.reference);
    } else {
      setSelectedGateId(null);
    }
  };

  const displayedBrief = activeBriefOverride || currentDecisionBrief;
  const gates = stadiumContext?.gates || [];

  return (
    <DashboardLayout sidebar={<OperationsSidebar />}>
      {/* Page Title & Error Banner */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center select-none">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase">
              Operations Control Center
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Live venue operations overview and decision intelligence engine telemetry.
            </p>
          </div>
          {/* Synchronize manual action status info indicators */}
          <div className="flex items-center gap-2">
            {(isTriggeringScenario || isGeneratingDecision || isLoadingContext) && (
              <div className="flex items-center gap-1.5 text-xs text-primary-500 font-semibold font-mono animate-pulse">
                <IconWrapper icon={RefreshCw} size="sm" className="animate-spin" />
                <span>AI Pipeline Active</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-critical-50/20 dark:bg-critical-900/10 border border-critical-200/50 rounded-medium flex justify-between items-start gap-4 mt-2">
            <div className="flex gap-2">
              <IconWrapper icon={AlertOctagon} size="sm" className="text-critical-600 shrink-0 mt-0.5" />
              <p className="text-xs text-text-primary font-medium">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-[10px] text-text-muted hover:text-text-primary font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* A. Stadium Overview Header */}
      <StadiumOverviewHeader
        metadata={stadiumContext?.metadata}
        weather={stadiumContext?.weather}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Operations Control Twin and Simulation */}
        <div className="lg:col-span-2 space-y-6">
          {/* B. Gate Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center select-none">
              <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                Gate Entry Points
              </h2>
              <span className="text-[10px] text-text-muted font-medium">
                Click any gate card to run manual AI inquiry
              </span>
            </div>

            {isLoadingContext ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-28 bg-bg-card border border-border-color rounded-medium animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {gates.map((g) => (
                  <GateCard
                    key={g.id}
                    gate={g}
                    onClick={() => handleGateSelect(g.id)}
                    isActive={selectedGateId === g.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* C. Scenario Control Panel */}
          <ScenarioControlPanel
            onTriggerScenario={handleScenario}
            onReset={handleReset}
            isTriggering={isTriggeringScenario}
            isResetting={isLoadingContext && !isTriggeringScenario}
          />
        </div>

        {/* Right Col: AI Decision Output and History */}
        <div className="space-y-6">
          {/* D & E. Live Decision Brief Panel (D is click gate card/global button) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center select-none">
              <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                Active Recommendation
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold hover:underline h-auto p-0"
                onClick={() => requestDecision('periodic-scan', 'global', 'Manual Global Scan')}
                disabled={isGeneratingDecision || isTriggeringScenario || isLoadingContext}
              >
                Trigger Global Scan
              </Button>
            </div>

            <DecisionBrief
              brief={displayedBrief}
              isLoading={isGeneratingDecision || isTriggeringScenario}
              audienceOverride="operations"
            />
          </div>

          {/* F. Recent Decisions Log */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary select-none">
              Telemetry History
            </h2>
            <RecentDecisionsLog
              history={decisionHistory}
              onSelectBrief={handleSelectHistoricalBrief}
              activeBriefId={displayedBrief?.id}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
