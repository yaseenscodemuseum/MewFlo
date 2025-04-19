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
    // If we have a code in the URL, we're coming back from authentication
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      // We should be handled by the Callback component
      return;
    }

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
      
      // Redirect to the authentication URL
      window.location.href = authUrl;
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
                      onClick={handleBack}
                      className="w-[300px] h-[60px] bg-[#593c2d] hover:bg-[#593c2d]/30 text-[#ffd6a0] text-xl rounded-full"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleExport}
                      disabled={isAuthenticating}
                      className="w-[300px] h-[60px] bg-[#593c2d] hover:bg-[#593c2d]/90 text-[#ffd6a0] text-xl rounded-full"
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