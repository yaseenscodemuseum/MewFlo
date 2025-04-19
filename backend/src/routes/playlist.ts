import express from 'express';
import { generatePlaylist } from '../services/gemini';

const router = express.Router();

interface PlaylistPreferences {
  songCount: number;
  songs: string[];
  platform: string;
  excludeSuggestions?: boolean;
  genres?: string[];
  artists?: string[];
  languages?: string[];
  allowExplicit?: boolean;
  moods?: string[];
}

router.post('/generate', async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({ error: 'Preferences are required' });
    }

    if (!preferences.songs || preferences.songs.length === 0) {
      return res.status(400).json({ error: 'At least one song must be provided' });
    }

    if (!preferences.platform) {
      return res.status(400).json({ error: 'Platform is required' });
    }

    const playlist = await generatePlaylist(preferences);
    
    if (!Array.isArray(playlist) || playlist.length === 0) {
      return res.status(500).json({ error: 'Failed to generate a valid playlist' });
    }

    res.json(playlist);
  } catch (error: any) {
    console.error('Error generating playlist:', error);
    res.status(500).json({ error: error.message || 'Failed to generate playlist' });
  }
});

export default router; 