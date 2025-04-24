import * as express from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import { config } from 'dotenv';
import { google } from 'googleapis';

config();

const router = express.Router();
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
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
  platform: 'spotify' | 'youtube';
  uri?: string;
}

export const searchSongs = async (req: express.Request, res: express.Response) => {
  try {
    const { query, platform } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    let results: SearchResult[] = [];

    if (platform === 'spotify') {
      const spotifyResults = await spotifyApi.searchTracks(query as string);
      results = spotifyResults.body.tracks?.items.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        image: track.album.images[0]?.url,
        platform: 'spotify',
        uri: track.uri
      })) || [];
    } else if (platform === 'youtube') {
      const youtubeResults = await youtube.search.list({
        part: ['snippet'],
        q: query as string,
        type: ['video'],
        videoCategoryId: '10', // Music category
        maxResults: 10,
        key: process.env.YOUTUBE_API_KEY
      });

      results = youtubeResults.data.items?.map(item => ({
        id: item.id?.videoId || '',
        title: item.snippet?.title || '',
        artist: item.snippet?.channelTitle || '',
        image: item.snippet?.thumbnails?.high?.url || undefined,
        platform: 'youtube'
      })) || [];
    }

    res.json({ results });
  } catch (error) {
    console.error('Error searching songs:', error);
    res.status(500).json({ error: 'Failed to search songs' });
  }
};

export const searchRoutes = router; 