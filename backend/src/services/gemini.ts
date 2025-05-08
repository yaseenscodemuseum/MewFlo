import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface PlaylistItem {
  title: string;
  artist: string;
  reason: string;
}

export const generatePlaylist = async (preferences: {
  songCount: number;
  songs: string[];
  platform: string;
  excludeSuggestions?: boolean;
  genres?: string[];
  artists?: string[];
  languages?: string[];
  allowExplicit?: boolean;
  moods?: string[];
}): Promise<PlaylistItem[]> => {
  try {
    console.log("Generating playlist with preferences:", preferences);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-001',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
    
    // Calculate how many additional songs we need
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

    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Received response from Gemini");
    
    // Clean up the response text to ensure it's valid JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    console.log("Cleaned response:", cleanedText);
    
    const parsedResponse = JSON.parse(cleanedText);
    
    // Handle both array and object responses
    let playlist = Array.isArray(parsedResponse) ? parsedResponse : 
                  parsedResponse.playlist || parsedResponse.songs || [];
    
    // Validate and format the playlist
    if (Array.isArray(playlist)) {
      playlist = playlist.map(item => ({
        title: item.title || '',
        artist: item.artist || '',
        reason: item.reason || ''
      }));
    }

    if (playlist.length === 0) {
      throw new Error('Failed to generate a valid playlist');
    }
    
    // Verify we have the correct number of songs
    if (playlist.length !== requiredSongs) {
      console.warn(`Expected ${requiredSongs} songs but got ${playlist.length}. Adjusting...`);
      
      // If we have user songs that must be included
      const userSongTitles = preferences.songs.map(song => {
        // Extract just the title part (before any dash or hyphen)
        const match = song.match(/^([^-–—]+)/);
        return match ? match[1].trim().toLowerCase() : song.toLowerCase();
      });
      
      // Make sure user songs are included first
      const userSongs = playlist.filter((song: PlaylistItem) => 
        userSongTitles.some(title => 
          song.title.toLowerCase().includes(title)
        )
      );
      
      // Then add recommended songs
      const recommendedSongs = playlist.filter((song: PlaylistItem) => 
        !userSongTitles.some(title => 
          song.title.toLowerCase().includes(title)
        )
      );
      
      // Create the final playlist with the correct number of songs
      if (userSongs.length >= requiredSongs) {
        // If we have more user songs than required, trim
        playlist = userSongs.slice(0, requiredSongs);
      } else {
        // Add recommended songs to reach the required count
        const neededRecommendations = requiredSongs - userSongs.length;
        playlist = [
          ...userSongs,
          ...recommendedSongs.slice(0, neededRecommendations)
        ];
      }
    }

    console.log("Generated playlist:", playlist);
    return playlist;
  } catch (error: any) {
    console.error("Gemini error:", error);
    
    // Handle specific API key errors
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API Key not found')) {
      throw new Error('Invalid or missing API key. Please check your configuration.');
    }
    
    // Handle rate limit errors
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error('Rate limit exceeded. Please try again in a few minutes.');
    }

    // Handle model not found errors
    if (error.message?.includes('model not found')) {
      throw new Error('The AI model is currently unavailable. Please try again later.');
    }
    
    throw new Error('Failed to generate playlist: ' + error.message);
  }
}; 