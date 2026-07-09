# MewFlo - AI Playlist Maker

MewFlo is an AI-powered web app that generates personalized music playlists based on your song preferences, favorite genres, artists, languages, mood, and more — then exports them directly to Spotify or YouTube Music.

**Live Demo:** [https://mewflo.vercel.app](https://mewflo.vercel.app)

## Features

- AI playlist generation with 6-model fallback chain (Claude → Gemini → OpenAI → Deepseek → Qwen3)
- Export to Spotify (PKCE auth) and YouTube Music (OAuth 2.0)
- Song search across platforms
- Customizable preferences: genres, artists, languages, mood, explicit content filter, song count
- Smooth animated UI with responsive design

## Tech Stack

**Frontend** — React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Motion

**Backend** — Node.js, Express, TypeScript, Spotify Web API, Claude, Google Gemini, OpenAI, OpenRouter (Deepseek, Qwen3), YouTube Data API v3

## Getting Started

### Prerequisites

- Node.js >= 18
- A [Spotify Developer](https://developer.spotify.com/dashboard) app
- A [Google Cloud](https://console.cloud.google.com) project with:
  - OAuth 2.0 client (for YouTube export)
  - YouTube Data API v3 enabled
  - Gemini API key (from [Google AI Studio](https://aistudio.google.com/apikey))
- An [Anthropic](https://console.anthropic.com/settings/keys) API key (optional — primary model, used first when available)
- An [OpenAI](https://platform.openai.com/api-keys) API key (optional — fallback when Gemini is unavailable)
- An [OpenRouter](https://openrouter.ai/keys) API key (optional — free-tier fallback via Deepseek and Qwen3-235B)

### Setup

1. Clone and install:
```bash
git clone https://github.com/YaseensCodeMuseum/MewFlo.git
cd MewFlo
npm install
cd backend && npm install
```

2. Create a `.env` file in the project root (this file is gitignored and shared by both frontend and backend):
```env
PORT=3000

# Frontend (public — Vite bundles VITE_* vars into the browser JS)
VITE_API_URL=http://localhost:3000/api
VITE_SPOTIFY_CLIENT_ID=<your_spotify_client_id>
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
VITE_YOUTUBE_CLIENT_ID=<your_google_oauth_client_id>
VITE_YOUTUBE_REDIRECT_URI=http://localhost:5173/callback
VITE_YOUTUBE_API_KEY=<your_youtube_api_key>

# Backend secrets (never prefix these with VITE_)
ANTHROPIC_API_KEY=<your_anthropic_api_key>
GEMINI_API_KEY=<your_gemini_api_key>
OPENAI_API_KEY=<your_openai_api_key>
OPENROUTER_API_KEY=<your_openrouter_api_key>
SPOTIFY_CLIENT_ID=<your_spotify_client_id>
SPOTIFY_CLIENT_SECRET=<your_spotify_client_secret>
YOUTUBE_CLIENT_ID=<your_google_oauth_client_id>
YOUTUBE_CLIENT_SECRET=<your_google_oauth_client_secret>
YOUTUBE_API_KEY=<your_youtube_api_key>
```

> **Note:** `VITE_`-prefixed variables are embedded in the public JS bundle by design — only put client IDs and public API keys there, never secrets.

3. Run locally (two terminals):
```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173)

## Deployment

The project deploys as a single Vercel project — the frontend is served statically and the backend runs as a serverless function under `/api`.

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add the environment variables listed above in **Settings → Environment Variables** (use `VITE_API_URL=/api` for production)
4. Deploy

## Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Open a Pull Request

## License

MIT — see [LICENSE](LICENSE) for details.

## Contact

Instagram — [@yaleftonseen](https://instagram.com/yaleftonseen)

Portfolio — [yaseensportfolio.vercel.app](https://yaseensportfolio.vercel.app)
