# MewFlo - AI-Powered Playlist Generator

MewFlo is a web application that generates personalized playlists using AI. It supports both Spotify and YouTube Music platforms.

## Features

- AI-powered playlist generation based on user preferences
- Support for both Spotify and YouTube Music
- Beautiful and intuitive user interface
- Customizable playlist parameters
- Secure authentication with OAuth 2.0

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Spotify Developer Account
- Google Cloud Console Account (for YouTube Music)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mewflo.git
cd mewflo
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your API credentials:
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Environment Setup

### Spotify API
1. Create a Spotify Developer account
2. Create a new application
3. Add `http://127.0.0.1:8000/callback` to the Redirect URIs
4. Copy the Client ID and Client Secret

### YouTube Music API
1. Create a Google Cloud Console account
2. Create a new project
3. Enable the YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add `http://127.0.0.1:8000/callback` to the Authorized redirect URIs
6. Copy the Client ID and Client Secret

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
