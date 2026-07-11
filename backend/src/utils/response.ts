/**
 * Standard API response envelope helpers for ArenaMind.
 *
 * ALL Express route handlers must produce responses using these helpers.
 * The shape is stable and versioned so future clients can rely on it.
 *
 * Success shape:
 *   { status: "success", timestamp: ISO8601, data: <T> }
 *
 * Error shape:
 *   { status: "error", timestamp: ISO8601, error: { code: string, message: string } }
 */

export interface SuccessEnvelope<T> {
  status: 'success';
  timestamp: string;
  data: T;
}

export interface ErrorEnvelope {
  status: 'error';
  timestamp: string;
  error: {
    code: string;
    message: string;
  };
}

export type ApiEnvelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

/**
 * Wraps a payload in the standard success envelope.
 */
export function success<T>(data: T): SuccessEnvelope<T> {
  return {
    status: 'success',
    timestamp: new Date().toISOString(),
    data,
  };
}

/**
 * Wraps an error in the standard error envelope.
 * @param code  A short, machine-readable error code (e.g. "INVALID_SCENARIO").
 * @param message  A human-readable description of the error.
 */
export function failure(code: string, message: string): ErrorEnvelope {
  return {
    status: 'error',
    timestamp: new Date().toISOString(),
    error: { code, message },
  };
}
