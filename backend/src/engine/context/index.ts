/**
 * Context Engine — Public API Surface
 *
 * This is the only import path that route handlers and other modules should
 * use. It composes loader, store, validator, and scenarios into a clean,
 * stable interface.
 *
 * Internal modules (loader.ts, store.ts, validator.ts, scenarios.ts) should
 * NOT be imported directly from outside the engine/ directory.
 */

import { loadSeedData } from './loader';
import * as store from './store';
import { validate } from './validator';
import { applyHeavyRain, applyCrowdSurge, applyMedicalIncident } from './scenarios';
import type { StadiumContext } from '../../types';

// ─── Initialisation ──────────────────────────────────────────────────────────

let _seed: StadiumContext | null = null;

/**
 * Must be called once at application startup.
 * Reads seed data from disk, validates it, and initialises the in-memory store.
 */
export function initContextEngine(): void {
  const raw = loadSeedData();
  _seed = validate(raw);
  store.initialise(_seed);
  console.log('[Context Engine] Initialised. Stadium:', _seed.metadata.name);
}

// ─── Read ────────────────────────────────────────────────────────────────────

/**
 * Returns a deep clone of the current stadium context.
 * Safe to call from any route handler.
 */
export function getContext(): StadiumContext {
  return store.getState();
}

// ─── Reset ───────────────────────────────────────────────────────────────────

/**
 * Resets the context to the validated seed data, discarding any scenario
 * mutations. The seed was captured and validated at initContextEngine() time.
 */
export function resetContext(): StadiumContext {
  if (_seed === null) {
    throw new Error('[Context Engine] Cannot reset: engine has not been initialised.');
  }
  store.setState(_seed);
  return store.getState();
}

// ─── Scenarios ───────────────────────────────────────────────────────────────

/**
 * Applies the Heavy Rain scenario to the CURRENT state and persists the result.
 * Idempotent — safe to call multiple times.
 */
export function applyScenario_HeavyRain(): StadiumContext {
  const current = store.getState();
  const next = applyHeavyRain(current);
  store.setState(next);
  return store.getState();
}

/**
 * Applies the Crowd Surge scenario to the CURRENT state and persists the result.
 * Idempotent — safe to call multiple times.
 */
export function applyScenario_CrowdSurge(): StadiumContext {
  const current = store.getState();
  const next = applyCrowdSurge(current);
  store.setState(next);
  return store.getState();
}

/**
 * Applies the Medical Incident scenario to the CURRENT state and persists the result.
 * Idempotent — safe to call multiple times.
 */
export function applyScenario_MedicalIncident(): StadiumContext {
  const current = store.getState();
  const next = applyMedicalIncident(current);
  store.setState(next);
  return store.getState();
}

// ─── Re-exports for typing ───────────────────────────────────────────────────

export type { StadiumContext };
