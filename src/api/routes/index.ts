import * as express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { generatePlaylist } from './playlist';
import { searchRoutes } from './search';
import spotifyRoutes from './spotify';

// Load environment variables
config();

const router = express.Router();

// Enable CORS
router.use(cors());
router.use(express.json());

// Health check
router.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

// Playlist Generation Routes
router.post('/generate-playlist', generatePlaylist);

// Search Routes
router.use('/search', searchRoutes);

// Authentication Routes
router.use('/spotify', spotifyRoutes);

export default router; 