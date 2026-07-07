# MewFlo - AI Playlist Maker 🎵

MewFlo is an innovative web application that leverages artificial intelligence to create personalized music playlists. Built with modern web technologies, it provides an intuitive interface for users to generate playlists based on their preferences and mood.

🌐 **Live Demo:** [https://mewflo.vercel.app](https://mewflo.vercel.app)

## 🌟 Features

- AI-powered playlist generation
- Spotify integration
- Modern, responsive UI built with React and Tailwind CSS
- Real-time playlist creation and modification
- User-friendly interface with smooth animations

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI Components
- React Router DOM

### Backend
- Node.js
- Express
- TypeScript
- Spotify Web API
- Google Gemini Integration

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 18.0.0)
- npm or yarn
- Spotify Developer Account
- Google Cloud project (OAuth client for YouTube + Gemini API key)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/MewFlo.git
cd MewFlo
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Create a single `.env` file in the root directory — it is shared by the frontend and the backend. Vite only exposes `VITE_`-prefixed vars to the browser; everything else stays server-side:
```env
PORT=3000

# Frontend (PUBLIC — bundled into the shipped JS)
VITE_API_URL=http://localhost:3000/api
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
VITE_YOUTUBE_CLIENT_ID=your_google_oauth_client_id
VITE_YOUTUBE_REDIRECT_URI=http://localhost:5173/callback
VITE_YOUTUBE_API_KEY=your_youtube_data_api_key

# Backend secrets (never add a VITE_ prefix to these)
GEMINI_API_KEY=your_gemini_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
YOUTUBE_CLIENT_ID=your_google_oauth_client_id
YOUTUBE_CLIENT_SECRET=your_google_oauth_client_secret
YOUTUBE_API_KEY=your_youtube_data_api_key
```

In production the file isn't used — set the `VITE_` vars in the Vercel frontend project and the secret vars in the backend deployment's dashboard.

### Running Locally

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Building for Production

1. Build the frontend:
```bash
npm run build
```

2. Build the backend:
```bash
cd backend
npm run build
```

## 🚢 Deployment

The project is configured for deployment on Vercel. The `vercel.json` file contains the necessary configuration for deployment.

To deploy:

1. Push your changes to GitHub
2. Connect your repository to Vercel
3. Configure the environment variables in Vercel's dashboard
4. Deploy!

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

My Instagram - [@yaleftonseen](https://instagram.com/yaleftonseen)

Project Link: [https://github.com/yourusername/MewFlo](https://github.com/yourusername/MewFlo)
