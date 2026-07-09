import express, { Request, Response } from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
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

function buildPrompt(preferences: PlaylistPreferences): string {
  const requiredSongs = preferences.songCount;
  return `You are a music playlist generator. Create a playlist based on these preferences:

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
}

function parseAndNormalize(text: string, requiredSongs: number, preferences: PlaylistPreferences): PlaylistItem[] {
  const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
  const parsedResponse = JSON.parse(cleanedText);

  let playlist: PlaylistItem[] = Array.isArray(parsedResponse) ? parsedResponse :
    parsedResponse.playlist || parsedResponse.songs || [];

  playlist = playlist.map((item: any) => ({
    title: item.title || '',
    artist: item.artist || '',
    reason: item.reason || ''
  }));

  if (playlist.length === 0) {
    throw new Error('Failed to generate a valid playlist');
  }

  if (playlist.length !== requiredSongs) {
    const userSongTitles = preferences.songs.map(song => {
      const match = song.match(/^([^-–—]+)/);
      return match ? match[1].trim().toLowerCase() : song.toLowerCase();
    });

    const userSongs = playlist.filter(song =>
      userSongTitles.some(title => song.title.toLowerCase().includes(title))
    );
    const recommendedSongs = playlist.filter(song =>
      !userSongTitles.some(title => song.title.toLowerCase().includes(title))
    );

    if (userSongs.length >= requiredSongs) {
      playlist = userSongs.slice(0, requiredSongs);
    } else {
      playlist = [...userSongs, ...recommendedSongs.slice(0, requiredSongs - userSongs.length)];
    }
  }

  return playlist;
}

async function generateWithClaude(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: 'You are a music playlist generator. Always respond with valid JSON arrays. Do not include any text outside the JSON.',
    messages: [{ role: 'user', content: prompt }],
  });
  const textBlock = message.content.find((b: any) => b.type === 'text');
  return (textBlock as any)?.text || '[]';
}

async function generateWithGemini(prompt: string, modelName: string): Promise<string> {
  const model = getGenAI().getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    }
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateWithOpenAI(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 8192,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You are a music playlist generator. Always respond with valid JSON.' },
      { role: 'user', content: prompt }
    ]
  });
  return completion.choices[0]?.message?.content || '[]';
}

async function generateWithOpenRouter(prompt: string, model: string): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }
  const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });
  const completion = await openrouter.chat.completions.create({
    model,
    temperature: 0.7,
    max_tokens: 8192,
    messages: [
      { role: 'system', content: 'You are a music playlist generator. Always respond with valid JSON arrays. Do not include any text outside the JSON.' },
      { role: 'user', content: prompt }
    ]
  });
  return completion.choices[0]?.message?.content || '[]';
}

async function generatePlaylist(preferences: PlaylistPreferences): Promise<PlaylistItem[]> {
  const prompt = buildPrompt(preferences);
  const requiredSongs = preferences.songCount;

  const models: { name: string; fn: () => Promise<string> }[] = [];

  if (process.env.ANTHROPIC_API_KEY) {
    models.push({ name: 'claude-sonnet-4', fn: () => generateWithClaude(prompt) });
  }
  if (process.env.GEMINI_API_KEY) {
    models.push({ name: 'gemini-2.5-flash', fn: () => generateWithGemini(prompt, 'gemini-2.5-flash') });
    models.push({ name: 'gemini-2.0-flash', fn: () => generateWithGemini(prompt, 'gemini-2.0-flash') });
  }
  if (process.env.OPENAI_API_KEY) {
    models.push({ name: 'gpt-4o-mini', fn: () => generateWithOpenAI(prompt) });
  }
  if (process.env.OPENROUTER_API_KEY) {
    models.push({ name: 'tencent-hy3', fn: () => generateWithOpenRouter(prompt, 'tencent/hy3:free') });
    models.push({ name: 'gpt-oss-120b', fn: () => generateWithOpenRouter(prompt, 'openai/gpt-oss-120b:free') });
  }

  if (models.length === 0) {
    throw new Error('No AI API keys configured. Set at least one of: ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, OPENROUTER_API_KEY');
  }

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      console.log(`Trying model: ${model.name}`);
      const text = await model.fn();
      const playlist = parseAndNormalize(text, requiredSongs, preferences);
      console.log(`Success with ${model.name}`);
      return playlist;
    } catch (err: any) {
      console.error(`${model.name} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models failed to generate a playlist');
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
