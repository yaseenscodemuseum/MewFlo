import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Platform } from "../../api/musicService";
import { Logo } from "../../components/Logo";
import AdSense from '../../components/AdSense';

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Playlist {
  title: string;
  artist: string;
  reason: string;
}

interface LocationState {
  platform: Platform;
  genres: string[];
  artists: string[];
  languages: string[];
  explicit: boolean;
  mood: string;
  songs: string[];
  excludeSuggestions?: boolean;
  songCount?: number;
}

export const Loading = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [loading, setLoading] = useState(true);
  const [currentPlaylist, setCurrentPlaylist] = useState(0);
  const [playlists, setPlaylists] = useState<{ primary: Playlist[]; secondary: Playlist[] | null }>({
    primary: [],
    secondary: null
  });
  
  // Progress state
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("Starting playlist generation...");

  useEffect(() => {
    const startTime = Date.now();
    const minLoadingTime = 5000; // 5 seconds minimum loading time
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prevProgress => {
        // Progress to 95% during API call, remaining 5% after response
        const newProgress = loading ? Math.min(prevProgress + 1, 95) : 100;
        
        // Update progress text based on percentage
        if (newProgress < 25) {
          setProgressText("Analyzing your music preferences...");
        } else if (newProgress < 50) {
          setProgressText("Finding matching songs...");
        } else if (newProgress < 75) {
          setProgressText("Curating your personalized playlist...");
        } else if (newProgress < 95) {
          setProgressText("Finalizing selection...");
        } else {
          setProgressText("Playlist ready!");
        }
        
        return newProgress;
      });
    }, 50); // Update every 50ms for smooth animation
    
    const generatePlaylist = async () => {
      try {
        setProgressText("Sending request to AI...");
        
        const response = await fetch(`${API_URL}/playlist/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            preferences: {
              songCount: state.songCount || 25,
              songs: state.songs,
              excludeSuggestions: state.excludeSuggestions || false,
              platform: state.platform,
              genres: state.genres,
              artists: state.artists,
              languages: state.languages,
              allowExplicit: state.explicit,
              moods: state.mood ? [state.mood] : []
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Server error occurred' }));
          
          // Handle specific error cases
          if (errorData.error?.includes('429') || errorData.error?.includes('quota')) {
            throw new Error('The AI service is currently busy. Please try again in a few minutes.');
          }
          
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json().catch(() => {
          throw new Error('Invalid response from server');
        });
        
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid playlist data received');
        }
        
        // Ensure data is in the correct format
        const formattedData = data.map(item => ({
          title: item.title || 'Unknown Title',
          artist: item.artist || 'Unknown Artist',
          reason: item.reason || 'No reason provided'
        }));
        
        setPlaylists({
          primary: formattedData,
          secondary: null
        });
        
        setProgressText("Playlist generated successfully!");

        // Calculate remaining time to ensure minimum 5 seconds
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        // Wait for the remaining time before showing results
        setTimeout(() => {
          setLoading(false);
          navigate('/playlist', { 
            state: { 
              ...state,
              primary: formattedData,
              secondary: null,
              platform: state.platform
            } 
          });
        }, remainingTime);
      } catch (error) {
        console.error('Error generating playlist:', error);
        setLoading(false);
        
        // Set a more user-friendly error message
        let errorMessage = 'An error occurred while generating your playlist.';
        if (error instanceof Error) {
          if (error.message.includes('busy')) {
            errorMessage = error.message;
          } else if (error.message.includes('quota')) {
            errorMessage = 'The AI service is currently at capacity. Please try again in a few minutes.';
          }
        }
        
        setProgressText(errorMessage);
        navigate('/error', { 
          state: { 
            error: errorMessage,
            retryPath: '/',
            retryText: 'Try Again'
          } 
        });
      }
    };

    generatePlaylist();
    
    // Clean up interval on component unmount
    return () => clearInterval(progressInterval);
  }, [navigate, state]);

  const handleCreatePlaylist = () => {
    navigate('/export', {
      state: {
        platform: state.platform,
        primary: playlists.primary,
        secondary: playlists.secondary
      }
    });
  };

  const currentSongs = currentPlaylist === 0 ? playlists.primary : playlists.secondary;

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
              <h2 className="absolute w-[898px] h-44 top-[13px] left-[60px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#593c2d] text-[70px] text-center">
                Generating Your Playlist
              </h2>

              {/* Loading Animation */}
              <div className="absolute w-full top-[150px] flex flex-col items-center">
                {/* Progress Bar */}
                <div className="w-[600px] h-[30px] bg-[#593c2d]/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#593c2d]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
                
                {/* Progress Text */}
                <p className="mt-8 text-[#593c2d] text-2xl">{progressText}</p>
                
                {/* Progress Percentage */}
                <p className="mt-2 text-[#593c2d] text-xl font-bold">{progress}% Complete</p>
              </div>

              {/* Ad Space */}
              <div className="absolute bottom-8 left-8 right-8 h-[120px] bg-[#593c2d]/10 rounded-2xl flex items-center justify-center">
                <AdSense />
              </div>

              {/* Playlist Content */}
              <div className="absolute w-full top-[237px] flex flex-col items-center">
                {loading ? (
                  <div className="text-[#593c2d] text-2xl mt-28">
                    {/* Empty space for the progress bar above */}
                  </div>
                ) : (
                  <>
                    <div className="w-[800px] h-[300px] overflow-y-auto mb-8">
                      {currentSongs?.map((song, index) => (
                        <div key={index} className="mb-4 p-4 bg-white/10 rounded-lg">
                          <h3 className="text-[#593c2d] text-xl font-bold">{song.title}</h3>
                          <p className="text-[#593c2d]/80">{song.artist}</p>
                          <p className="text-[#593c2d]/60 text-sm mt-2">{song.reason}</p>
                        </div>
                      ))}
                    </div>

                    {/* Navigation Circles */}
                    <div className="flex items-center gap-4 mb-8">
                      <Button
                        variant="ghost"
                        className="w-8 h-8 p-0 rounded-full bg-[#593c2d]/20 hover:bg-[#6b4a3a]/30 transition-all duration-300 hover:shadow-[0_0_10px_rgba(89,60,45,0.3)]"
                        onClick={() => setCurrentPlaylist(0)}
                      >
                        <span className="text-[#593c2d]">1</span>
                      </Button>
                      {playlists.secondary && (
                        <>
                          <span className="text-[#593c2d]">←</span>
                          <Button
                            variant="ghost"
                            className="w-8 h-8 p-0 rounded-full bg-[#593c2d]/20 hover:bg-[#6b4a3a]/30 transition-all duration-300 hover:shadow-[0_0_10px_rgba(89,60,45,0.3)]"
                            onClick={() => setCurrentPlaylist(1)}
                          >
                            <span className="text-[#593c2d]">2</span>
                          </Button>
                          <span className="text-[#593c2d]">→</span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Export Button - Moved outside the card */}
          {!loading && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8"
            >
              <Button
                className="w-[300px] h-[60px] bg-[#593c2d] hover:bg-[#6b4a3a] text-white text-xl rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(89,60,45,0.5)]"
                onClick={handleCreatePlaylist}
              >
                Export to {state.platform === 'spotify' ? 'Spotify' : 'YouTube Music'}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}; 