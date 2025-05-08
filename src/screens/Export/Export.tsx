import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { createMusicService, Platform } from "../../api/musicService";
import { Logo } from "../../components/Logo";

interface LocationState {
  platform: Platform;
  primary: Array<{
    title: string;
    artist: string;
    reason: string;
  }>;
  secondary?: Array<{
    title: string;
    artist: string;
    reason: string;
  }>;
}

export const Export = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we don't have state, we shouldn't be here
    if (!state) {
      navigate('/');
      return;
    }
  }, [navigate, state]);

  const handleExport = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      // Store the state in localStorage for the callback
      localStorage.setItem('platform', state.platform);
      localStorage.setItem('playlistState', JSON.stringify(state));

      const musicService = createMusicService(state.platform);
      const authUrl = await musicService.getAuthUrl();
      
      // Open the authentication URL in a new window
      const authWindow = window.open(authUrl, 'Spotify Auth', 'width=600,height=700');
      
      // Listen for the callback
      const checkAuth = setInterval(async () => {
        try {
          const code = localStorage.getItem('auth_code');
          if (code) {
            clearInterval(checkAuth);
            localStorage.removeItem('auth_code');
            
            // Handle the authentication callback
            await musicService.handleAuthCallback(code);
            
            // Create the playlist
            const trackIds = await Promise.all(
              state.primary.map(async (song) => {
                const results = await musicService.searchTracks(`${song.title} ${song.artist}`, 1);
                return results[0]?.id;
              })
            );

            const validTrackIds = trackIds.filter(Boolean);
            await musicService.createPlaylist(
              'MewFlo Generated Playlist',
              'Created with MewFlo - Your AI Playlist Generator',
              validTrackIds
            );

            // Close the auth window and navigate to success
            if (authWindow) {
              authWindow.close();
            }
            navigate('/success');
          }
        } catch (error) {
          console.error('Error during authentication:', error);
          setError('Authentication failed. Please try again.');
          setIsAuthenticating(false);
          clearInterval(checkAuth);
        }
      }, 1000);

      // Cleanup interval after 5 minutes
      setTimeout(() => {
        clearInterval(checkAuth);
        if (authWindow) {
          authWindow.close();
        }
        if (isAuthenticating) {
          setError('Authentication timed out. Please try again.');
          setIsAuthenticating(false);
        }
      }, 300000);
    } catch (error: any) {
      console.error('Error starting authentication:', error);
      if (error.message.includes('testing mode')) {
        setError('This app is in testing mode. Please contact the developer to be added as a test user.');
      } else {
        setError('Failed to start authentication. Please try again.');
      }
      setIsAuthenticating(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        {/* Logo */}
        <Logo />

        {/* Main Card */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          <Card className="w-[1029px] h-[618px] bg-[#ffd6a0] rounded-[80px] border-none relative">
            <CardContent className="p-0">
              {/* Card Title */}
              <h2 className="absolute w-[898px] h-44 top-[13px] left-[60px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#593c2d] text-[80px] text-center">
                Export to {state.platform === 'spotify' ? 'Spotify' : 'YouTube Music'}
              </h2>

              {/* Content */}
              <div className="absolute w-full top-[237px] flex flex-col items-center">
                <div className="w-[800px] flex flex-col items-center gap-8">
                  <p className="text-[#593c2d] text-2xl text-center">
                    <b>Sign in to your {state.platform === 'spotify' ? 'Spotify' : 'YouTube Music'} account to export your playlist.</b>
                  </p>

                  {error && (
                    <p className="text-red-600 text-xl">{error}</p>
                  )}

                  <div className="flex justify-between w-full px-8">
                    <Button
                      className="w-[300px] h-[60px] bg-[#593c2d] hover:bg-[#6b4a3a] text-[#ffd6a0] text-xl rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(89,60,45,0.5)]"
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleExport}
                      disabled={isAuthenticating}
                      className="w-[300px] h-[60px] bg-[#593c2d] hover:bg-[#6b4a3a] text-[#ffd6a0] text-xl rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(89,60,45,0.5)]"
                    >
                      {isAuthenticating ? 'Authenticating...' : 'Sign In & Export'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}; 