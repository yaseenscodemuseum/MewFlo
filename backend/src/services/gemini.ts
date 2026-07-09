import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

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

export const generatePlaylist = async (preferences: PlaylistPreferences): Promise<PlaylistItem[]> => {
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
    models.push({ name: 'deepseek-chat-v3', fn: () => generateWithOpenRouter(prompt, 'deepseek/deepseek-chat-v3-0324:free') });
    models.push({ name: 'qwen3-235b', fn: () => generateWithOpenRouter(prompt, 'qwen/qwen3-235b-a22b:free') });
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
};
