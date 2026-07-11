/**
 * Context Engine — In-Memory Store
 *
 * Holds the single, authoritative copy of the stadium context in process
 * memory. All reads and writes go through this module.
 *
 * Design decisions:
 * - State is plain JS object, not a proxy or reactive store.
 * - `setState` performs a deep-clone via structuredClone so callers cannot
 *   accidentally mutate the stored copy through a held reference.
 * - `getState` returns a deep clone for the same reason. Consumers should
 *   treat the returned object as read-only.
 * - The store is initialised via `initialise()` which is called once from
 *   the application entry point (index.ts). Calling getState() before
 *   initialise() throws an explicit error rather than returning undefined.
 */

import type { StadiumContext } from '../../types';

let _state: StadiumContext | null = null;

/**
 * Initialises the store with a seed or reset context.
 * Must be called before any call to getState() or setState().
 */
export function initialise(seed: StadiumContext): void {
  _state = structuredClone(seed);
}

/**
 * Returns a deep clone of the current stadium context.
 * @throws If the store has not yet been initialised.
 */
export function getState(): StadiumContext {
  if (_state === null) {
    throw new Error(
      '[Context Engine / Store] Store has not been initialised. Call initialise() first.',
    );
  }
  return structuredClone(_state);
}

/**
 * Replaces the stored context with a deep clone of the provided context.
 * The provided object is validated by the caller (see scenarios.ts) before
 * being passed here — the store itself does not re-validate.
 */
export function setState(context: StadiumContext): void {
  _state = structuredClone(context);
}

/**
 * Returns `true` if the store has been initialised.
 */
export function isInitialised(): boolean {
  return _state !== null;
}
