import { Request, Response } from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import { google } from 'googleapis';

// Initialize Spotify client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Get and refresh Spotify access token
async function getSpotifyAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body.access_token);
    return data.body.access_token;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
}

// Refresh token every hour
setInterval(getSpotifyAccessToken, 3600 * 1000);
getSpotifyAccessToken(); // Initial token

const youtube = google.youtube('v3');

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  album?: string;
  image?: string;
  platform: 'spotify' | 'youtube' | 'apple';
  uri?: string; // For Spotify track URI
}

export const searchSongs = async (req: Request, res: Response) => {
  try {
    const { query, platform } = req.query as { query: string; platform: string };
    let results: SearchResult[] = [];

    switch (platform) {
      case 'spotify':
        results = await searchSpotify(query);
        break;
      case 'youtube':
        results = await searchYouTube(query);
        break;
      case 'apple':
        results = await searchAppleMusic(query);
        break;
      default:
        throw new Error('Invalid platform specified');
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Search failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search songs'
    });
  }
};

async function searchSpotify(query: string): Promise<SearchResult[]> {
  try {
    const data = await spotifyApi.searchTracks(query, { limit: 10 });
    return data.body.tracks?.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      image: track.album.images[0]?.url,
      platform: 'spotify',
      uri: track.uri
    })) || [];
  } catch (error) {
    console.error('Spotify search error:', error);
    // Try refreshing token on error
    await getSpotifyAccessToken();
    throw error;
  }
}

async function searchYouTube(query: string): Promise<SearchResult[]> {
  const response = await youtube.search.list({
    part: ['snippet'],
    q: query,
    type: ['video'],
    videoCategoryId: '10', // Music category
    maxResults: 10,
    key: process.env.YOUTUBE_API_KEY
  });

  return (response.data.items?.map(item => ({
    id: item.id?.videoId || '',
    title: item.snippet?.title || '',
    artist: item.snippet?.channelTitle || '',
    image: item.snippet?.thumbnails?.high?.url || undefined,
    platform: 'youtube'
  })) || []) as SearchResult[];
}

async function searchAppleMusic(query: string): Promise<SearchResult[]> {
  // TODO: Implement Apple Music search
  console.log(`Searching Apple Music for: ${query}`);
  return [];
} 