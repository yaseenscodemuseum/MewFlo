import { spotifyAPI } from './spotify';
import { youtubeAPI } from './youtube';

export type Platform = 'spotify' | 'youtube';

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail?: string;
  platform: Platform;
}

class MusicService {
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
  }

  async getAuthUrl(): Promise<string> {
    if (this.platform === 'spotify') {
      return spotifyAPI.getAuthUrl();
    } else {
      return youtubeAPI.getAuthUrl();
    }
  }

  async handleAuthCallback(code: string): Promise<void> {
    if (this.platform === 'spotify') {
      await spotifyAPI.handleAuthCallback(code);
    } else {
      await youtubeAPI.handleAuthCallback(code);
    }
  }

  async searchTracks(query: string, limit: number = 10): Promise<Track[]> {
    try {
      let results;
      if (this.platform === 'spotify') {
        const spotifyResults = await spotifyAPI.searchTracks(query, limit);
        results = spotifyResults.map((track: any) => ({
          id: track.id,
          title: track.name,
          artist: track.artists[0].name,
          thumbnail: track.album.images[0]?.url,
          platform: 'spotify' as Platform,
        }));
      } else {
        const youtubeResults = await youtubeAPI.searchTracks(query, limit);
        results = youtubeResults.map((track: any) => ({
          ...track,
          platform: 'youtube' as Platform,
        }));
      }
      return results;
    } catch (error) {
      console.error(`Error searching tracks on ${this.platform}:`, error);
      throw error;
    }
  }

  async createPlaylist(name: string, description: string, tracks: string[]): Promise<void> {
    try {
      if (this.platform === 'spotify') {
        await spotifyAPI.createPlaylist(name, description, tracks);
      } else {
        await youtubeAPI.createPlaylist(name, description, tracks);
      }
    } catch (error) {
      console.error(`Error creating playlist on ${this.platform}:`, error);
      throw error;
    }
  }
}

export const createMusicService = (platform: Platform) => new MusicService(platform); 