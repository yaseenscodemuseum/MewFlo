import * as express from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import { config } from 'dotenv';

config();

const router = express.Router();
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Get authentication URL
router.get('/auth', (req: express.Request, res: express.Response) => {
  const scopes = [
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-private',
    'user-read-email'
  ];

  const authUrl = spotifyApi.createAuthorizeURL(scopes, 'state');
  res.json({ authUrl });
});

// Handle authentication callback
router.get('/auth/callback', async (req: express.Request, res: express.Response) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const data = await spotifyApi.authorizationCodeGrant(code as string);
    spotifyApi.setAccessToken(data.body.access_token);
    spotifyApi.setRefreshToken(data.body.refresh_token);

    res.json({ success: true });
  } catch (error) {
    console.error('Error handling Spotify auth callback:', error);
    res.status(500).json({ error: 'Failed to authenticate with Spotify' });
  }
});

// Create playlist
router.post('/playlist', async (req: express.Request, res: express.Response) => {
  try {
    const { name, description, trackUris } = req.body;
    if (!name || !trackUris || !Array.isArray(trackUris)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const playlist = await spotifyApi.createPlaylist(name, { description });
    await spotifyApi.addTracksToPlaylist(playlist.body.id, trackUris);

    res.json({ playlistId: playlist.body.id });
  } catch (error) {
    console.error('Error creating Spotify playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

export const spotifyRoutes = router; 