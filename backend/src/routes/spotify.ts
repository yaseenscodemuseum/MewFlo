import express from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/callback'
});

// Store temporary playlists until user authenticates
const tempPlaylists = new Map<string, string[]>();

router.get('/auth', (req, res) => {
  const scopes = ['playlist-modify-public', 'playlist-modify-private'];
  const state = 'spotify_auth_state';
  
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  res.redirect(authorizeURL);
});

router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (state !== 'spotify_auth_state') {
    res.redirect('/#error=state_mismatch');
    return;
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code as string);
    const { access_token, refresh_token } = data.body;

    // Store tokens in session or database
    // For now, we'll just redirect with tokens
    res.redirect(`/#access_token=${access_token}&refresh_token=${refresh_token}`);
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    res.redirect('/#error=invalid_token');
  }
});

export const createSpotifyPlaylist = async (req: express.Request, res: express.Response) => {
  const { name, description, tracks, userId } = req.body;

  try {
    // Store tracks and description temporarily
    tempPlaylists.set(userId, tracks);
    console.log(`Preparing playlist "${name}" with description: ${description}`);

    res.json({
      success: true,
      message: 'Playlist prepared. Please authenticate to save it.',
      authUrl: spotifyApi.createAuthorizeURL(['playlist-modify-public'], userId)
    });
  } catch (error) {
    console.error('Error preparing playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to prepare playlist' });
  }
};

export const saveSpotifyPlaylist = async (req: express.Request, res: express.Response) => {
  const { userId, name, description } = req.body;
  const tracks = tempPlaylists.get(userId);

  if (!tracks) {
    return res.status(404).json({ success: false, error: 'No playlist found' });
  }

  try {
    // Create playlist
    const playlist = await spotifyApi.createPlaylist(name, {
      description,
      public: true
    });

    // Add tracks to playlist
    await spotifyApi.addTracksToPlaylist(playlist.body.id, tracks);

    // Clean up
    tempPlaylists.delete(userId);

    res.json({
      success: true,
      playlistId: playlist.body.id,
      playlistUrl: playlist.body.external_urls.spotify
    });
  } catch (error) {
    console.error('Error saving playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to save playlist' });
  }
};

export default router; 