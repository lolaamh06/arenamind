import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all routes (necessary for frontend communication)
app.use(cors());
app.use(express.json());

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Confirms the ArenaMind backend is running and healthy.
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ArenaMind Backend Decision Engine',
  });
});

// Start listening for connections
app.listen(PORT, () => {
  console.log(`[ArenaMind Server] running on http://localhost:${PORT}`);
});
