import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import router from './routes';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
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

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api', router);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 