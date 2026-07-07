import express from 'express';
import cors from 'cors';
import router from './routes';

// The Express app, shared between local dev (server.ts) and the Vercel
// serverless function (api/index.ts at the repo root). No dotenv or
// app.listen here — the entrypoints handle those.
const app = express();

// CORS configuration. When frontend and API are served from the same Vercel
// project this is same-origin and CORS never triggers; it only matters for
// local dev (5173 -> 3000) or if the API is ever hosted separately.
const corsOptions = {
  origin: [
    'https://mewflo.vercel.app',     // Production frontend
    'https://mewflo-git-main-yaseenscodemuseum.vercel.app',  // Vercel preview deployments
    'http://localhost:5173',         // Development frontend (Vite default port)
    'http://localhost:3000'          // Alternative development port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', router);

export default app;
