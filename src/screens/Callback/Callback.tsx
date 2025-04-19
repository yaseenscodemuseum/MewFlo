import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createMusicService } from "../../api/musicService";

export const Callback = (): JSX.Element => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from the URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const error = params.get('error');
        
        if (error) {
          throw new Error(`Authorization failed: ${error}`);
        }
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Get the stored platform and playlist state
        const platform = localStorage.getItem('platform');
        const playlistState = localStorage.getItem('playlistState');

        if (!platform || !playlistState) {
          throw new Error('Missing platform or playlist state');
        }

        // Create the appropriate music service
        const musicService = createMusicService(platform as 'spotify' | 'youtube');
        
        // Handle the authentication callback
        await musicService.handleAuthCallback(code);

        // Clear the stored data
        localStorage.removeItem('platform');
        localStorage.removeItem('playlistState');

        // Navigate to success page with the playlist state
        navigate('/success', { state: JSON.parse(playlistState) });
      } catch (error: any) {
        console.error('Error during authentication callback:', error);
        navigate('/error', { 
          state: { 
            error: error.message || 'Authentication failed. Please try again.',
            platform: localStorage.getItem('platform')
          } 
        });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#003526] flex items-center justify-center">
      <div className="text-white text-2xl">Completing authentication...</div>
    </div>
  );
}; 