import { google } from 'googleapis';
import { config } from 'dotenv';

config();

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

const youtube = google.youtube('v3');

export class YouTubeMusicService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from storage if available
    const storedTokens = localStorage.getItem('youtube_tokens');
    if (storedTokens) {
      const { accessToken, refreshToken } = JSON.parse(storedTokens);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    }
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true
    });
  }

  async handleAuthCallback(code: string): Promise<void> {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      this.accessToken = tokens.access_token || null;
      this.refreshToken = tokens.refresh_token || null;

      // Store tokens
      localStorage.setItem('youtube_tokens', JSON.stringify({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken
      }));

      oauth2Client.setCredentials(tokens);
    } catch (error) {
      console.error('Error handling YouTube auth callback:', error);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      oauth2Client.setCredentials({
        refresh_token: this.refreshToken
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      this.accessToken = credentials.access_token || null;

      // Update stored tokens
      localStorage.setItem('youtube_tokens', JSON.stringify({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken
      }));

      oauth2Client.setCredentials(credentials);
    } catch (error) {
      console.error('Error refreshing YouTube access token:', error);
      throw error;
    }
  }

  async createPlaylist(name: string, description: string, videoIds: string[]): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      // Create playlist
      const playlistResponse = await youtube.playlists.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: name,
            description: description
          },
          status: {
            privacyStatus: 'private'
          }
        }
      });

      const playlistId = playlistResponse.data.id;
      if (!playlistId) {
        throw new Error('Failed to create playlist');
      }

      // Add videos to playlist
      for (const videoId of videoIds) {
        await youtube.playlistItems.insert({
          part: ['snippet'],
          requestBody: {
            snippet: {
              playlistId: playlistId,
              resourceId: {
                kind: 'youtube#video',
                videoId: videoId
              }
            }
          }
        });
      }

      return playlistId;
    } catch (error) {
      console.error('Error creating YouTube playlist:', error);
      throw error;
    }
  }

  async searchTracks(query: string, limit: number = 10): Promise<Array<{ id: string; title: string; artist: string; image?: string }>> {
    try {
      const response = await youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        videoCategoryId: '10', // Music category
        maxResults: limit,
        key: process.env.YOUTUBE_API_KEY
      });

      return response.data.items?.map(item => ({
        id: item.id?.videoId || '',
        title: item.snippet?.title || '',
        artist: item.snippet?.channelTitle || '',
        image: item.snippet?.thumbnails?.high?.url || undefined
      })) || [];
    } catch (error) {
      console.error('Error searching YouTube tracks:', error);
      throw error;
    }
  }
} 