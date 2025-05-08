import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createMusicService } from "../../api/musicService";

export const Callback = (): JSX.Element => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from the URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (code) {
          // Store the code in localStorage for the main window to pick up
          localStorage.setItem('auth_code', code);
          
          // Close this window
          window.close();
        } else {
          console.error('No authorization code received');
          window.close();
        }
      } catch (error) {
        console.error('Error handling callback:', error);
        window.close();
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#003526] text-white">
      <p>Completing authentication...</p>
    </div>
  );
}; 