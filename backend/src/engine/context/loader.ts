/**
 * Context Engine — Loader
 *
 * Reads the seed JSON file from disk once at startup and returns it
 * as a typed StadiumContext. The loader is intentionally dumb — it only
 * reads and parses. Validation and in-memory storage are handled
 * separately by validator.ts and store.ts.
 *
 * Why read from disk at startup rather than import()?
 * - Allows the seed file to be swapped without a TypeScript recompile.
 * - Keeps the separation between static assets and compiled code clean.
 */

import fs from 'fs';
import path from 'path';
import type { StadiumContext } from '../../types';

const SEED_FILE_PATH = path.resolve(__dirname, '../../data/stadium-state.json');

/**
 * Loads the stadium seed data from disk.
 * @throws If the file cannot be read or parsed.
 */
export function loadSeedData(): StadiumContext {
  let raw: string;

  try {
    raw = fs.readFileSync(SEED_FILE_PATH, 'utf-8');
  } catch (err) {
    throw new Error(
      `[Context Engine / Loader] Failed to read seed file at "${SEED_FILE_PATH}": ${String(err)}`,
    );
  }

  try {
    return JSON.parse(raw) as StadiumContext;
  } catch (err) {
    throw new Error(
      `[Context Engine / Loader] Seed file at "${SEED_FILE_PATH}" is not valid JSON: ${String(err)}`,
    );
  }
}
