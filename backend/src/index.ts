import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { initContextEngine } from './engine/context';
import contextRoutes from './routes/context.routes';
import scenarioRoutes from './routes/scenarios.routes';
import reasoningRoutes from './routes/reasoning.routes';
import decisionsRoutes from './routes/decisions.routes';
import { failure } from './utils/response';

// Load environment variables from .env file
dotenv.config();

// ─── Initialise Context Engine ───────────────────────────────────────────────
// Must happen before any request can be served. Reads seed data from disk
// and populates the in-memory stadium state.
initContextEngine();

// ─── Express Application ─────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all routes (necessary for frontend communication)
app.use(cors());
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Confirms the ArenaMind backend is running and healthy.
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ArenaMind Backend Decision Engine',
  });
});

// Context Engine: stadium state read + reset
app.use('/api/context', contextRoutes);

// Scenario mutations
app.use('/api/scenarios', scenarioRoutes);

// AI Reasoning Pipeline — Phase 3A debug scaffold (kept for low-level inspection)
app.use('/api/reasoning', reasoningRoutes);

// AI Decision Pipeline — Phase 3B (Output Validator → Confidence → Memory → Orchestrator)
app.use('/api/decisions', decisionsRoutes);

// ─── Global Error Handler ────────────────────────────────────────────────────
// Catches any unhandled errors from route handlers and returns a consistent
// error envelope instead of letting Express send its default HTML error page.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ArenaMind Server] Unhandled error:', err);
  res
    .status(500)
    .json(failure('INTERNAL_SERVER_ERROR', err.message || 'An unexpected error occurred.'));
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[ArenaMind Server] running on http://localhost:${PORT}`);
});
