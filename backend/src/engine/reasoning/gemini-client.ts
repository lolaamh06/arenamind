/**
 * ArenaMind AI Reasoning Pipeline — Gemini Client
 *
 * RESPONSIBILITY:
 * Sends a prompt string to the Gemini API and returns the raw text response.
 * This module is intentionally thin and single-purpose:
 *   ✅ Accept a prompt string
 *   ✅ Call Gemini
 *   ✅ Return raw text (or throw a typed error)
 *   ❌ Do NOT parse or validate the JSON response — that is Phase 3B's job
 *   ❌ Do NOT apply business logic — that is the Orchestrator's job
 *
 * ─── SDK CHOICE ─────────────────────────────────────────────────────────────
 * Using: @google/generative-ai (the official Google Generative AI Node.js SDK)
 * Why: It is the canonical, Google-maintained SDK for Gemini API access from
 * Node.js. It handles authentication, request serialization, and streaming
 * natively. The alternative (raw fetch against the REST API) would require
 * manually managing authentication headers and response shapes — unnecessary
 * complexity when the SDK is stable and well-documented.
 * Docs: https://ai.google.dev/gemini-api/docs/quickstart?lang=node
 *
 * ─── MODEL CHOICE ───────────────────────────────────────────────────────
 * Using: gemini-2.5-flash
 * Why: gemini-2.5-flash is the best current model for latency-sensitive,
 * cost-appropriate structured-output tasks (confirmed available on this project
 * as of July 2026). It provides:
 *   - Low latency (1–4s typical) suitable for real-time stadium operations
 *   - 1M token context window — well beyond our focused prompt sizes
 *   - Excellent instruction-following for strict JSON schema adherence
 *   - Thinking capability that improves reasoning quality for multi-factor decisions
 *   - Free-tier and paid access available
 * gemini-2.5-pro offers deeper reasoning but at higher latency — overkill for
 * the per-gate, per-incident decisions this pipeline produces.
 *
 * ─── RETRY POLICY ───────────────────────────────────────────────────────────
 * Retry once on transient failures (network errors, timeouts, 5xx responses).
 * Do NOT retry on:
 *   - 400 Bad Request       → malformed prompt (fix the prompt, not the call)
 *   - 401/403 Unauthorized  → invalid API key (fix credentials, not the call)
 *   - 429 Rate Limited      → caller should back off at a higher level
 * Retry delay: 1500ms (enough for a transient blip, short enough for UX)
 * Max attempts: 2 (1 initial + 1 retry)
 *
 * ─── TIMEOUT ────────────────────────────────────────────────────────────────
 * 12 seconds. gemini-2.5-flash typically responds in 1-4s for our prompt sizes.
 * 12s is generous enough to handle occasional API latency spikes without making
 * the operations UI feel unresponsive.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiRawResponse } from '../../types/reasoning';

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_NAME = 'gemini-2.5-flash';
const TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 1_500;
const MAX_ATTEMPTS = 2;

// ─── Typed errors ─────────────────────────────────────────────────────────────

/**
 * Thrown when a Gemini API call times out (exceeds TIMEOUT_MS).
 * Callers should treat this as a transient failure and surface a user-friendly
 * message rather than propagating the raw error.
 */
export class GeminiTimeoutError extends Error {
  constructor(attemptNumber: number) {
    super(`[Gemini Client] Request timed out after ${TIMEOUT_MS}ms on attempt ${attemptNumber}.`);
    this.name = 'GeminiTimeoutError';
  }
}

/**
 * Thrown on non-transient API errors (bad request, auth failure) or when all
 * retry attempts have been exhausted.
 */
export class GeminiAPIError extends Error {
  public readonly originalError: unknown;

  constructor(message: string, originalError?: unknown) {
    super(`[Gemini Client] ${message}`);
    this.name = 'GeminiAPIError';
    this.originalError = originalError;
  }
}

// ─── API key validation ───────────────────────────────────────────────────────

/**
 * Validates the GEMINI_API_KEY environment variable at module load time.
 * Throws a clear, descriptive error immediately rather than failing silently
 * on the first API call — easier to debug in development and CI.
 */
function resolveApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '') {
    throw new GeminiAPIError(
      'GEMINI_API_KEY environment variable is missing or empty. ' +
        'Add it to your .env file: GEMINI_API_KEY=your_api_key_here. ' +
        'Obtain a key at https://aistudio.google.com/app/apikey',
    );
  }
  return key.trim();
}

// ─── Lazy client initialisation ─────────────────────────────────────────────
//
// Initialization is deferred to first use rather than module load time.
// This ensures dotenv.config() in index.ts has already run before we attempt
// to read GEMINI_API_KEY, avoiding a race where the env var isn't yet loaded.

let _model: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']> | null = null;

function getModel() {
  if (_model) return _model;

  const key = resolveApiKey();
  const genAI = new GoogleGenerativeAI(key);
  _model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      // Instruct the model to output JSON directly.
      // responseMimeType is supported by gemini-2.0-flash and ensures the model
      // doesn't wrap its JSON in markdown fences even without explicit instruction.
      responseMimeType: 'application/json',
    },
  });
  return _model;
}

// ─── Transient error detection ────────────────────────────────────────────────

/**
 * Returns true if the error appears to be a transient network/infrastructure
 * failure that is worth retrying. Returns false for client errors (bad request,
 * auth) which would fail again on retry.
 */
function isTransientError(err: unknown): boolean {
  if (err instanceof GeminiTimeoutError) return true;

  // SDK errors contain a status code when the API returned an HTTP error
  const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

  // Transient: network-level or server-side failures
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('503') ||
    message.includes('500') ||
    message.includes('502') ||
    message.includes('504')
  ) {
    return true;
  }

  // Non-transient: client errors — do not retry these
  if (
    message.includes('400') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('429')
  ) {
    return false;
  }

  // Unknown error — default to retrying once (fail-safe)
  return true;
}

// ─── Core call with timeout ───────────────────────────────────────────────────

/**
 * Calls Gemini with a timeout race. Returns the raw response text.
 * Throws GeminiTimeoutError if the call exceeds TIMEOUT_MS.
 */
async function callWithTimeout(prompt: string, attempt: number): Promise<string> {
  const model = getModel();

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new GeminiTimeoutError(attempt)), TIMEOUT_MS),
  );

  const callPromise = model.generateContent(prompt).then((result) => {
    const text = result.response.text();
    if (!text || text.trim() === '') {
      throw new GeminiAPIError('Gemini returned an empty response.');
    }
    return text;
  });

  return Promise.race([callPromise, timeoutPromise]);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Sends a prompt to Gemini and returns the raw text response.
 *
 * Retry policy: retries once on transient failures after RETRY_DELAY_MS.
 * Does not retry on client errors (bad request, auth failure, rate limiting).
 *
 * This function returns the raw string — do NOT parse or validate here.
 * Phase 3B's Output Validator owns that responsibility.
 *
 * @throws GeminiTimeoutError if both attempts time out
 * @throws GeminiAPIError on non-transient failures or exhausted retries
 */
export async function callGemini(prompt: string): Promise<GeminiRawResponse> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const rawText = await callWithTimeout(prompt, attempt);
      if (attempt > 1) {
        console.log(`[Gemini Client] Succeeded on attempt ${attempt}.`);
      }
      return rawText;
    } catch (err) {
      lastError = err;

      const shouldRetry = isTransientError(err) && attempt < MAX_ATTEMPTS;

      if (shouldRetry) {
        console.warn(
          `[Gemini Client] Attempt ${attempt} failed (${err instanceof Error ? err.message : String(err)}). ` +
            `Retrying in ${RETRY_DELAY_MS}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        // Non-transient error or final attempt exhausted — throw immediately
        break;
      }
    }
  }

  // All attempts exhausted or non-transient error
  if (lastError instanceof GeminiTimeoutError || lastError instanceof GeminiAPIError) {
    throw lastError;
  }

  throw new GeminiAPIError(
    `All ${MAX_ATTEMPTS} attempt(s) failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    lastError,
  );
}
