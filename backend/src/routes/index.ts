import express from 'express';
import playlistRouter from './playlist';
import youtubeRouter from './youtube';
import { searchSongs } from './search';

const router = express.Router();

// Health check
router.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Playlist Generation Routes
router.use('/playlist', playlistRouter);

// YouTube OAuth token exchange
router.use('/youtube', youtubeRouter);

// Search Routes
router.get('/search', searchSongs);

export default router;
