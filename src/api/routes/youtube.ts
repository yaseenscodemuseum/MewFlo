import * as express from 'express';
import { YouTubeMusicService } from '../services/youtube-music';

const router = express.Router();
const youtubeService = new YouTubeMusicService();

// Get authentication URL
router.get('/auth', (_req: express.Request, res: express.Response) => {
  const authUrl = youtubeService.getAuthUrl();
  res.json({ authUrl });
});

// Handle authentication callback
router.get('/auth/callback', async (req: express.Request, res: express.Response) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    await youtubeService.handleAuthCallback(code as string);
    res.json({ success: true });
  } catch (error) {
    console.error('Error handling YouTube auth callback:', error);
    res.status(500).json({ error: 'Failed to authenticate with YouTube' });
  }
});

// Create playlist
router.post('/playlist', async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, videoIds } = req.body;
    if (!name || !videoIds || !Array.isArray(videoIds)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const playlistId = await youtubeService.createPlaylist(name, description, videoIds);
    res.json({ playlistId });
  } catch (error) {
    console.error('Error creating YouTube playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

export const youtubeRoutes = router; 