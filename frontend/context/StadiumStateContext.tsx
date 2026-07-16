'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, ApiError } from '../lib/api-client';
import { StadiumContext, DecisionBrief } from '../types';

interface StadiumStateContextProps {
  stadiumContext: StadiumContext | null;
  currentDecisionBrief: DecisionBrief | null;
  decisionHistory: DecisionBrief[];
  isLoadingContext: boolean;
  isTriggeringScenario: boolean;
  isGeneratingDecision: boolean;
  isLoadingHistory: boolean;
  error: string | null;

  loadContext: () => Promise<void>;
  resetContext: () => Promise<void>;
  triggerScenario: (scenarioName: 'heavy-rain' | 'crowd-surge' | 'medical-incident') => Promise<void>;
  requestDecision: (
    triggerType: 'scenario-mutation' | 'manual-request' | 'periodic-scan',
    reference: string,
    description?: string
  ) => Promise<void>;
  loadHistory: () => Promise<void>;
  clearError: () => void;
}

const StadiumStateContext = createContext<StadiumStateContextProps | undefined>(undefined);

export const StadiumStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stadiumContext, setStadiumContext] = useState<StadiumContext | null>(null);
  const [currentDecisionBrief, setCurrentDecisionBrief] = useState<DecisionBrief | null>(null);
  const [decisionHistory, setDecisionHistory] = useState<DecisionBrief[]>([]);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isTriggeringScenario, setIsTriggeringScenario] = useState(false);
  const [isGeneratingDecision, setIsGeneratingDecision] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const loadContext = async () => {
    setIsLoadingContext(true);
    setError(null);
    try {
      const data = await api.getContext();
      setStadiumContext(data);
    } catch (err) {
      console.error('Failed to load stadium context:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to fetch stadium twin state.');
    } finally {
      setIsLoadingContext(false);
    }
  };

  const resetContext = async () => {
    setIsLoadingContext(true);
    setError(null);
    try {
      const res = await api.resetContext();
      // Backend now returns { context, decisionBrief: null } — both the
      // world-state and Decision Memory are cleared atomically server-side.
      // Mirror that immediately in local state so the UI reflects the calm
      // default without waiting for the next 30-second poll cycle.
      setStadiumContext(res.context);
      setCurrentDecisionBrief(null);
      setDecisionHistory([]);
    } catch (err) {
      console.error('Failed to reset context:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to reset stadium twin state.');
    } finally {
      setIsLoadingContext(false);
    }
  };

  const triggerScenario = async (scenarioName: 'heavy-rain' | 'crowd-surge' | 'medical-incident') => {
    setIsTriggeringScenario(true);
    setError(null);
    try {
      const res = await api.triggerScenario(scenarioName);
      setStadiumContext(res.context);
      setCurrentDecisionBrief(res.decisionBrief);
      // Prepend to history so it updates instantly
      setDecisionHistory((prev) => [res.decisionBrief, ...prev]);
    } catch (err) {
      console.error(`Failed to trigger scenario ${scenarioName}:`, err);
      setError(err instanceof ApiError ? err.message : `Failed to trigger scenario mutation: ${scenarioName}`);
    } finally {
      setIsTriggeringScenario(false);
    }
  };

  const requestDecision = async (
    triggerType: 'scenario-mutation' | 'manual-request' | 'periodic-scan',
    reference: string,
    description?: string
  ) => {
    setIsGeneratingDecision(true);
    setError(null);
    try {
      const brief = await api.generateDecision(triggerType, reference, description);
      setCurrentDecisionBrief(brief);
      setDecisionHistory((prev) => [brief, ...prev]);
    } catch (err) {
      console.error('Failed to request decision brief:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to generate AI decision recommendation.');
    } finally {
      setIsGeneratingDecision(false);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const historyRes = await api.getDecisionHistory();
      // History from backend is oldest-first; reverse to show newest first
      const reversed = [...historyRes.briefs].reverse();
      setDecisionHistory(reversed);
      // Seed (or update) currentDecisionBrief from the most recent history entry.
      // Uses a timestamp comparison so that:
      //  • On initial mount (prev === null): always sets the newest brief.
      //  • During polling: replaces stale brief with a newer one from history
      //    (e.g., scenario triggered from the Operations Portal in another tab).
      //  • Does NOT overwrite a brief that is already newer than history
      //    (e.g., user just triggered a scenario in the current tab — that
      //    in-memory brief is already up-to-date).
      if (reversed.length > 0) {
        setCurrentDecisionBrief((prev) => {
          if (!prev) return reversed[0];
          const prevTime = new Date(prev.generatedAt).getTime();
          const newTime = new Date(reversed[0].generatedAt).getTime();
          return newTime > prevTime ? reversed[0] : prev;
        });
      }
    } catch (err) {
      console.error('Failed to load decision history:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to load historical decision briefs.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Initial load + live-polling so stadium state stays fresh in every tab.
  // The 30-second interval keeps the Fan Portal in sync even when a scenario
  // is triggered from the Operations Portal in a different tab.
  useEffect(() => {
    loadContext();
    loadHistory();

    const POLL_INTERVAL_MS = 30_000;
    const intervalId = setInterval(() => {
      // Poll both context AND history so the Fan Portal's advisory banner
      // reflects the latest AI decision even when it lives in a separate tab
      // from the Operations Portal that triggered the scenario.
      loadContext();
      loadHistory();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <StadiumStateContext.Provider
      value={{
        stadiumContext,
        currentDecisionBrief,
        decisionHistory,
        isLoadingContext,
        isTriggeringScenario,
        isGeneratingDecision,
        isLoadingHistory,
        error,
        loadContext,
        resetContext,
        triggerScenario,
        requestDecision,
        loadHistory,
        clearError,
      }}
    >
      {children}
    </StadiumStateContext.Provider>
  );
};

export const useStadiumState = () => {
  const context = useContext(StadiumStateContext);
  if (context === undefined) {
    throw new Error('useStadiumState must be used within a StadiumStateProvider');
  }
  return context;
};
