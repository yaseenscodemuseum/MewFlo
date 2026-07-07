import axios from 'axios';

// PKCE helpers — Spotify's recommended flow for browser apps (no client secret needed)
function generateCodeVerifier(length = 64): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => possible[v % possible.length]).join('');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export class SpotifyAPI {
  private clientId: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    this.redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    this.accessToken = localStorage.getItem('spotify_access_token');
    this.refreshToken = localStorage.getItem('spotify_refresh_token');
  }

  async getAuthUrl(): Promise<string> {
    const scopes = [
      'playlist-modify-public',
      'playlist-modify-private',
      'user-read-private',
      'user-read-email'
    ];

    const verifier = generateCodeVerifier();
    localStorage.setItem('spotify_code_verifier', verifier);
    const challenge = await generateCodeChallenge(verifier);

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      code_challenge_method: 'S256',
      code_challenge: challenge,
      show_dialog: 'true'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async handleAuthCallback(code: string): Promise<void> {
    const verifier = localStorage.getItem('spotify_code_verifier');
    if (!verifier) {
      throw new Error('Missing PKCE code verifier. Please try signing in again.');
    }

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          code_verifier: verifier,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      localStorage.removeItem('spotify_code_verifier');

      if (this.accessToken) {
        localStorage.setItem('spotify_access_token', this.accessToken);
      }
      if (this.refreshToken) {
        localStorage.setItem('spotify_refresh_token', this.refreshToken);
      }
    } catch (error: any) {
      console.error('Spotify authentication error:', error.response?.data || error);
      if (error.response?.status === 400) {
        throw new Error('Authorization failed. Please try again.');
      }
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: this.clientId,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      this.accessToken = response.data.access_token;
      if (this.accessToken) {
        localStorage.setItem('spotify_access_token', this.accessToken);
      }
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
        localStorage.setItem('spotify_refresh_token', response.data.refresh_token);
      }
    } catch (error) {
      console.error('Error refreshing Spotify token:', error);
      throw error;
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Spotify');
    }
  }

  async searchTracks(query: string, limit: number = 10): Promise<any[]> {
    await this.ensureAuthenticated();

    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        params: {
          q: query,
          type: 'track',
          limit
        }
      });

      return response.data.tracks.items;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.searchTracks(query, limit);
      }
      throw error;
    }
  }

  async createPlaylist(name: string, description: string, trackIds: string[]): Promise<void> {
    await this.ensureAuthenticated();

    try {
      // First, get the user's ID
      const userResponse = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      const userId = userResponse.data.id;

      // Create the playlist
      const playlistResponse = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name,
          description,
          public: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const playlistId = playlistResponse.data.id;

      // Add tracks to the playlist
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          uris: trackIds.map(id => `spotify:track:${id}`)
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.createPlaylist(name, description, trackIds);
      }
      throw error;
    }
  }
}

export const spotifyAPI = new SpotifyAPI();
