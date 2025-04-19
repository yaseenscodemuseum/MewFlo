import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Initialize AI clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface PlaylistRequest {
  songCount: number;
  likedSongs: string[];
  includeSuggestions: boolean;
  platform: 'spotify' | 'youtube' | 'apple';
  genres?: string[];
  artists?: string[];
  languages?: string[];
  explicit?: boolean;
  mood?: string;
}

export const generatePlaylist = async (req: Request<{}, {}, PlaylistRequest>, res: Response) => {
  try {
    const params = req.body;
    const geminiPrompt = generateAIPrompt(params);
    
    // Generate with Gemini
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const geminiResult = await geminiModel.generateContent(geminiPrompt);
    const geminiPlaylist = await processGeminiResponse(geminiResult);

    // Generate with OpenAI as fallback
    let openaiPlaylist = null;
    try {
      const openaiResult = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: geminiPrompt }],
      });
      openaiPlaylist = processOpenAIResponse(openaiResult);
    } catch (error) {
      console.error('OpenAI generation failed:', error);
    }

    res.json({
      success: true,
      playlists: {
        gemini: geminiPlaylist,
        openai: openaiPlaylist,
      }
    });
  } catch (error) {
    console.error('Playlist generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate playlist'
    });
  }
};

function generateAIPrompt(params: PlaylistRequest): string {
  const {
    songCount,
    likedSongs,
    includeSuggestions,
    platform,
    genres,
    artists,
    languages,
    explicit,
    mood
  } = params;

  return `Generate a playlist with the following parameters:
    - Number of songs: ${songCount}
    - Songs to include: ${likedSongs.join(', ')}
    - Include suggestions: ${includeSuggestions}
    - Platform: ${platform}
    ${genres ? `- Preferred genres: ${genres.join(', ')}` : ''}
    ${artists ? `- Preferred artists: ${artists.join(', ')}` : ''}
    ${languages ? `- Preferred languages: ${languages.join(', ')}` : ''}
    ${explicit !== undefined ? `- Allow explicit content: ${explicit}` : ''}
    ${mood ? `- Desired mood/vibe: ${mood}` : ''}
    
    Please provide a curated playlist that matches these preferences.`;
}

function processGeminiResponse(response: any) {
  try {
    const text = response.response.text();
    return parsePlaylistResponse(text);
  } catch (error) {
    console.error('Error processing Gemini response:', error);
    return null;
  }
}

function processOpenAIResponse(response: any) {
  try {
    const text = response.choices[0].message.content;
    return parsePlaylistResponse(text);
  } catch (error) {
    console.error('Error processing OpenAI response:', error);
    return null;
  }
}

function parsePlaylistResponse(text: string) {
  // Extract song titles and artists from the AI response
  const lines = text.split('\n');
  const songs = lines
    .filter(line => line.trim() && !line.startsWith('-'))
    .map(line => {
      const [title, artist] = line.split(' - ').map(s => s.trim());
      return { title, artist };
    })
    .filter(song => song.title && song.artist);

  return songs;
} 