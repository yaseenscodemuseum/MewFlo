import { Request, Response } from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';

// Lazily construct the client and fetch a client-credentials token, refreshing
// it shortly before expiry. Doing everything on demand (instead of at module
// load) means missing credentials surface as a request error rather than
// crashing at startup, and env vars are read after dotenv has run.
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
  const spotifyApi = await getSpotifyApi();
  const data = await spotifyApi.searchTracks(query, { limit: 10 });
  return data.body.tracks?.items.map((track: SpotifyApi.TrackObjectFull) => ({
    id: track.id,
    title: track.name,
    artist: track.artists[0].name,
    album: track.album.name,
    image: track.album.images[0]?.url,
    platform: 'spotify' as const,
    uri: track.uri
  })) || [];
}

async function searchYouTube(query: string): Promise<SearchResult[]> {
  const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults: 10,
      key: process.env.YOUTUBE_API_KEY
    }
  });

  return (response.data.items?.map((item: any) => ({
    id: item.id?.videoId || '',
    title: item.snippet?.title || '',
    artist: item.snippet?.channelTitle || '',
    image: item.snippet?.thumbnails?.high?.url || undefined,
    platform: 'youtube'
  })) || []) as SearchResult[];
}
