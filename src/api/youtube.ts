import axios from 'axios';
import { config } from '@/config';

export class YouTubeAPI {
  private apiKey: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.apiKey = config.youtube.apiKey;
    this.clientId = config.youtube.clientId;
    this.clientSecret = config.youtube.clientSecret;
    this.redirectUri = 'http://127.0.0.1:8000/callback';
  }

  getAuthUrl(): string {
    const clientId = this.clientId;
    const redirectUri = this.redirectUri;
    const scope = 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl';
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');
    authUrl.searchParams.append('include_granted_scopes', 'true');
    
    return authUrl.toString();
  }

  async handleAuthCallback(code: string): Promise<void> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code'
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;

      // Store tokens in localStorage for persistence
      if (this.accessToken) {
        localStorage.setItem('youtube_access_token', this.accessToken);
      }
      if (this.refreshToken) {
        localStorage.setItem('youtube_refresh_token', this.refreshToken);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('This app is in testing mode. Please contact the developer to be added as a test user.');
      }
      console.error('YouTube authentication error:', error.response?.data || error);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      const storedRefreshToken = localStorage.getItem('youtube_refresh_token');
      if (storedRefreshToken) {
        this.refreshToken = storedRefreshToken;
      } else {
        throw new Error('No refresh token available');
      }
    }

    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token'
      });

      this.accessToken = response.data.access_token;
      if (this.accessToken) {
        localStorage.setItem('youtube_access_token', this.accessToken);
      }
    } catch (error) {
      console.error('Error refreshing YouTube token:', error);
      throw error;
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with YouTube');
    }
  }

  async searchTracks(query: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: limit,
          key: this.apiKey
        }
      });

      return response.data.items;
    } catch (error) {
      console.error('YouTube search error:', error);
      throw error;
    }
  }

  async createPlaylist(name: string, description: string, videoIds: string[]): Promise<void> {
    await this.ensureAuthenticated();

    try {
      // First, create the playlist
      const playlistResponse = await axios.post(
        'https://www.googleapis.com/youtube/v3/playlists',
        {
          snippet: {
            title: name,
            description: description
          },
          status: {
            privacyStatus: 'public'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const playlistId = playlistResponse.data.id;

      // Add videos to the playlist
      for (const videoId of videoIds) {
        await axios.post(
          'https://www.googleapis.com/youtube/v3/playlistItems',
          {
            snippet: {
              playlistId: playlistId,
              resourceId: {
                kind: 'youtube#video',
                videoId: videoId
              }
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.createPlaylist(name, description, videoIds);
      }
      throw error;
    }
  }
}

export const youtubeAPI = new YouTubeAPI(); 