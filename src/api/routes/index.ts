import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { generatePlaylist } from './playlist';
import { searchSongs } from './search';
import { spotifyAuth, spotifyCallback } from './spotify';
import { appleMusicAuth } from './apple-music';

// Load environment variables
config();

const router = express.Router();

// Enable CORS
router.use(cors());
router.use(express.json());

// Health check
router.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Playlist Generation Routes
router.post('/generate-playlist', generatePlaylist);

// Search Routes
router.get('/search/songs', searchSongs);

// Authentication Routes
router.get('/auth/spotify', spotifyAuth);
router.get('/auth/spotify/callback', spotifyCallback);
router.post('/auth/apple-music', appleMusicAuth);

export default router; 