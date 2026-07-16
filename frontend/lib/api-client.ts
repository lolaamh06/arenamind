/**
 * ArenaMind API Client (Phase 4A)
 *
 * Wraps calls to the backend endpoints, unwraps the envelope shape,
 * and handles typed errors.
 */

import { ApiResponseEnvelope, StadiumContext, DecisionBrief, ScenarioResponse, ResetResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    let errorData: ApiResponseEnvelope<never> | null = null;
    try {
      errorData = await response.json();
    } catch {
      // JSON parsing failed
    }

    const message = errorData?.error?.message || response.statusText || 'An unknown network error occurred';
    const code = errorData?.error?.code || 'NETWORK_ERROR';
    throw new ApiError(response.status, message, code);
  }

  const envelope: ApiResponseEnvelope<T> = await response.json();

  if (envelope.status === 'error') {
    throw new ApiError(
      response.status,
      envelope.error?.message || 'Server returned an error status',
      envelope.error?.code || 'SERVER_ERROR'
    );
  }

  if (envelope.data === undefined) {
    throw new ApiError(response.status, 'Response did not contain data payload');
  }

  return envelope.data;
}

export const api = {
  /**
   * GET /api/context
   * Fetches the current live StadiumContext.
   */
  getContext: () => request<StadiumContext>('/api/context'),

  /**
   * POST /api/context/reset
   * Resets BOTH the StadiumContext and Decision Memory to a clean baseline.
   * Returns { context: StadiumContext, decisionBrief: null }.
   */
  resetContext: () => request<ResetResponse>('/api/context/reset', { method: 'POST' }),

  /**
   * POST /api/scenarios/:scenarioName
   * Triggers a scenario mutation. Returns both mutated context and generated DecisionBrief.
   */
  triggerScenario: (scenarioName: 'heavy-rain' | 'crowd-surge' | 'medical-incident') =>
    request<ScenarioResponse>(`/api/scenarios/${scenarioName}`, { method: 'POST' }),

  /**
   * POST /api/decisions/generate
   * Generates a DecisionBrief for a given trigger manually.
   */
  generateDecision: (triggerType: 'scenario-mutation' | 'manual-request' | 'periodic-scan', reference: string, description?: string) =>
    request<DecisionBrief>('/api/decisions/generate', {
      method: 'POST',
      body: JSON.stringify({ triggerType, reference, description }),
    }),

  /**
   * GET /api/decisions/history
   * Retrieves the full decision history.
   */
  getDecisionHistory: () => request<{ total: number; briefs: DecisionBrief[] }>('/api/decisions/history'),

  /**
   * GET /api/decisions/by-reference/:reference
   * Retrieves all decision briefs concerning a specific reference.
   */
  getDecisionsByReference: (reference: string) =>
    request<{ reference: string; total: number; briefs: DecisionBrief[] }>(`/api/decisions/by-reference/${reference}`),
};
