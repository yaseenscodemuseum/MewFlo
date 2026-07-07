import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';

const app = express();

app.use(cors({
  origin: [
    'https://mewflo.vercel.app',
    'https://mewflo-git-main-yaseenscodemuseum.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// --- Gemini service ---

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

interface PlaylistItem {
  title: string;
  artist: string;
  reason: string;
}

async function generatePlaylist(preferences: {
  songCount: number;
  songs: string[];
  platform: string;
  excludeSuggestions?: boolean;
  genres?: string[];
  artists?: string[];
  languages?: string[];
  allowExplicit?: boolean;
  moods?: string[];
}): Promise<PlaylistItem[]> {
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    }
  });

  const requiredSongs = preferences.songCount;

  const prompt = `You are a music playlist generator. Create a playlist based on these preferences:

User Preferences:
- Number of songs: ${requiredSongs}
${preferences.excludeSuggestions ?
    `- Must generate ${requiredSongs} new songs that complement these songs: ${preferences.songs.join(', ')}` :
    `- Must include these ${preferences.songs.length} songs: ${preferences.songs.join(', ')}
   ${preferences.songs.length < requiredSongs ? `- Must generate exactly ${requiredSongs - preferences.songs.length} additional songs` : ''}`
  }
- Platform: ${preferences.platform}
${preferences.genres?.length ? `- Preferred genres: ${preferences.genres.join(', ')}` : ''}
${preferences.artists?.length ? `- Preferred artists: ${preferences.artists.join(', ')}` : ''}
${preferences.languages?.length ? `- Preferred languages: ${preferences.languages.join(', ')}` : ''}
${preferences.allowExplicit !== undefined ? `- Allow explicit content: ${preferences.allowExplicit}` : ''}
${preferences.moods?.length ? `- Desired moods: ${preferences.moods.join(', ')}` : ''}

Requirements:
${preferences.excludeSuggestions ?
    `1. Generate ${requiredSongs} completely new songs that complement the user's input songs
   2. Do not include any of the user's input songs in the playlist
   3. Consider the user's input songs as reference for style and mood` :
    `1. Include ALL specified songs in the playlist
   ${preferences.songs.length < requiredSongs ? `2. Generate EXACTLY ${requiredSongs - preferences.songs.length} additional songs that complement the specified songs` : ''}
   ${preferences.songs.length < requiredSongs ? '3. Consider all user preferences when selecting additional songs' : ''}`
  }
4. Ensure songs are available on the specified platform
5. Provide a clear reason for each song selection

Response Format:
Return a JSON array of objects with this exact structure:
[
  {
    "title": "Song Title",
    "artist": "Artist Name",
    "reason": "Detailed explanation of why this song was chosen based on user preferences"
  }
]

Important:
- Only return valid JSON
- Do not include any additional text or explanations
- Ensure all songs are real and available on the specified platform
- Make sure the reasons are specific and reference the user's preferences
- The total number of songs in the playlist MUST be exactly ${requiredSongs}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
  const parsedResponse = JSON.parse(cleanedText);

  let playlist = Array.isArray(parsedResponse) ? parsedResponse :
    parsedResponse.playlist || parsedResponse.songs || [];

  if (Array.isArray(playlist)) {
    playlist = playlist.map((item: any) => ({
      title: item.title || '',
      artist: item.artist || '',
      reason: item.reason || ''
    }));
  }

  if (playlist.length === 0) {
    throw new Error('Failed to generate a valid playlist');
  }

  if (playlist.length !== requiredSongs) {
    const userSongTitles = preferences.songs.map(song => {
      const match = song.match(/^([^-–—]+)/);
      return match ? match[1].trim().toLowerCase() : song.toLowerCase();
    });

    const userSongs = playlist.filter((song: PlaylistItem) =>
      userSongTitles.some(title => song.title.toLowerCase().includes(title))
    );
    const recommendedSongs = playlist.filter((song: PlaylistItem) =>
      !userSongTitles.some(title => song.title.toLowerCase().includes(title))
    );

    if (userSongs.length >= requiredSongs) {
      playlist = userSongs.slice(0, requiredSongs);
    } else {
      const neededRecommendations = requiredSongs - userSongs.length;
      playlist = [...userSongs, ...recommendedSongs.slice(0, neededRecommendations)];
    }
  }

  return playlist;
}

// --- Spotify search ---

let spotifyApi: SpotifyWebApi | null = null;
let tokenExpiresAt = 0;

async function getSpotifyApi(): Promise<SpotifyWebApi> {
  if (!spotifyApi) {
    spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
  }
  if (Date.now() >= tokenExpiresAt - 60_000) {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body.access_token);
    tokenExpiresAt = Date.now() + data.body.expires_in * 1000;
  }
  return spotifyApi;
}

// --- Routes ---

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Playlist generation
app.post('/api/playlist/generate', async (req, res) => {
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

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'The AI service is currently at capacity. Please try again in a few minutes.',
        retryAfter: 60
      });
    }
    if (error.message?.includes('API')) {
      return res.status(503).json({
        error: 'The AI service is temporarily unavailable. Please try again later.',
        retryAfter: 300
      });
    }

    res.status(500).json({
      error: 'Failed to generate playlist',
      details: error.message || 'An unexpected error occurred'
    });
  }
});

// YouTube OAuth token exchange
app.post('/api/youtube/token', async (req, res) => {
  const { code, redirectUri } = req.body;

  if (!code || !redirectUri) {
    return res.status(400).json({ error: 'code and redirectUri are required' });
  }

  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    console.error('YouTube token exchange failed:', error.response?.data || error.message);
    res.status(status).json({ error: 'Failed to exchange authorization code' });
  }
});

// YouTube token refresh
app.post('/api/youtube/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'refreshToken is required' });
  }

  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    res.json({
      access_token: response.data.access_token,
      expires_in: response.data.expires_in
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    console.error('YouTube token refresh failed:', error.response?.data || error.message);
    res.status(status).json({ error: 'Failed to refresh token' });
  }
});

// Song search
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const { query, platform } = req.query as { query: string; platform: string };
    let results: any[] = [];

    if (platform === 'spotify') {
      const api = await getSpotifyApi();
      const data = await api.searchTracks(query, { limit: 10 });
      results = data.body.tracks?.items.map((track: any) => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        image: track.album.images[0]?.url,
        platform: 'spotify',
        uri: track.uri
      })) || [];
    } else if (platform === 'youtube') {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          videoCategoryId: '10',
          maxResults: 10,
          key: process.env.YOUTUBE_API_KEY
        }
      });
      results = response.data.items?.map((item: any) => ({
        id: item.id?.videoId || '',
        title: item.snippet?.title || '',
        artist: item.snippet?.channelTitle || '',
        image: item.snippet?.thumbnails?.high?.url || undefined,
        platform: 'youtube'
      })) || [];
    } else {
      return res.status(400).json({ success: false, error: 'Invalid platform' });
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Search failed:', error);
    res.status(500).json({ success: false, error: 'Failed to search songs' });
  }
});

export default app;
