import { config } from 'dotenv';
import path from 'path';

// Load environment variables for local dev: prefer the repo-root .env
// (shared with the frontend), fall back to backend/.env if present.
// Imported for its side effect BEFORE any module that reads process.env.
// On Vercel, env vars come from the dashboard and neither file exists.
config({ path: path.resolve(__dirname, '../../.env') });
config();
