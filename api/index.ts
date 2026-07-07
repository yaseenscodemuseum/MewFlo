// Vercel serverless entrypoint: wraps the Express backend so the whole API
// runs as a single function. All /api/* requests are rewritten here (see
// vercel.json); the app itself mounts its router at /api, so paths line up.
// Env vars come from the Vercel dashboard — no dotenv needed here.
import app from '../backend/src/app';

export default app;
