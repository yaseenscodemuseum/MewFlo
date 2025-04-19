import { Request, Response } from 'express';
import SpotifyWebApi from 'spotify-web-api-node';

if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REDIRECT_URI) {
  throw new Error('Missing required Spotify environment variables');
}

// Initialize Spotify client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Store temporary playlists until user authenticates
const tempPlaylists = new Map<string, string[]>();

export const spotifyAuth = (_req: Request, res: Response) => {
  try {
    const scopes = ['playlist-modify-public', 'playlist-modify-private'];
    const state = Math.random().toString(36).substring(7);
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    res.json({ url: authorizeURL });
  } catch (error) {
    console.error('Spotify auth error:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

export const spotifyCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Invalid authorization code' });
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;
    
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    res.json({ success: true });
  } catch (error) {
    console.error('Error in Spotify callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const createSpotifyPlaylist = async (req: Request, res: Response) => {
  const { name, description, tracks, userId } = req.body;

  if (!name || !tracks || !Array.isArray(tracks) || !userId) {
    return res.status(400).json({ error: 'Invalid playlist data' });
  }

  try {
    tempPlaylists.set(userId, tracks);
    console.log(`Preparing playlist "${name}" with description: ${description}`);

    res.json({
      success: true,
      message: 'Playlist prepared. Please authenticate to save it.',
      authUrl: spotifyApi.createAuthorizeURL(['playlist-modify-public'], userId)
    });
  } catch (error) {
    console.error('Error preparing playlist:', error);
    res.status(500).json({ error: 'Failed to prepare playlist' });
  }
};

export const saveSpotifyPlaylist = async (req: Request, res: Response) => {
  const { userId, name, description } = req.body;
  const tracks = tempPlaylists.get(userId);

  if (!tracks) {
    return res.status(404).json({ error: 'No playlist found' });
  }

  try {
    const playlist = await spotifyApi.createPlaylist(name, {
      description,
      public: true
    });

    await spotifyApi.addTracksToPlaylist(playlist.body.id, tracks);
    tempPlaylists.delete(userId);

    res.json({
      success: true,
      playlistId: playlist.body.id,
      playlistUrl: playlist.body.external_urls.spotify
    });
  } catch (error) {
    console.error('Error saving playlist:', error);
    res.status(500).json({ error: 'Failed to save playlist' });
  }
}; 