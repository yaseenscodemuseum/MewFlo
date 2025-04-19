import express from 'express';
import playlistRouter from './playlist';
import spotifyRouter from './spotify';
import { searchSongs } from './search';

const router = express.Router();

// Health check
router.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Playlist Generation Routes
router.use('/playlist', playlistRouter);

// Spotify Routes
router.use('/spotify', spotifyRouter);

// Search Routes
router.get('/search', searchSongs);

export default router; 