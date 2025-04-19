import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Logo } from "../../components/Logo";
import { createMusicService, Platform } from "../../api/musicService";

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

export const Playlist = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);

      // Navigate to export page with the playlist data
      navigate('/export', { state });
    } catch (error) {
      console.error('Error exporting playlist:', error);
      setError('Failed to export playlist. Please try again.');
    } finally {
      setIsExporting(false);
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
                Your Generated Playlist
              </h2>

              {/* Content */}
              <div className="absolute w-full top-[237px] flex flex-col items-center">
                <div className="w-[800px] flex flex-col items-center gap-8">
                  {/* Primary Playlist */}
                  <div className="w-full">
                    <h3 className="text-[#593c2d] text-2xl font-bold mb-4">Main Playlist</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                      {state.primary.map((song, index) => (
                        <div key={index} className="bg-[#593c2d]/10 p-4 rounded-lg">
                          <p className="text-[#593c2d] text-xl font-medium">{song.title}</p>
                          <p className="text-[#593c2d]/70 text-lg">{song.artist}</p>
                          <p className="text-[#593c2d]/50 text-sm mt-2">{song.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Playlist */}
                  {state.secondary && state.secondary.length > 0 && (
                    <div className="w-full">
                      <h3 className="text-[#593c2d] text-2xl font-bold mb-4">Alternative Suggestions</h3>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto">
                        {state.secondary.map((song, index) => (
                          <div key={index} className="bg-[#593c2d]/10 p-4 rounded-lg">
                            <p className="text-[#593c2d] text-xl font-medium">{song.title}</p>
                            <p className="text-[#593c2d]/70 text-lg">{song.artist}</p>
                            <p className="text-[#593c2d]/50 text-sm mt-2">{song.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <p className="text-red-600 text-xl">{error}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Buttons Container */}
        <div className="flex justify-between w-[1229px] mt-8">
          <Button
            onClick={handleBack}
            className="w-[300px] h-[60px] bg-[#ffd6a0] hover:bg-[#ffd6a0]/90 text-[#593c2d] text-xl rounded-full"
          >
            Back
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-[300px] h-[60px] bg-[#ffd6a0] hover:bg-[#ffd6a0]/90 text-[#593c2d] text-xl rounded-full"
          >
            {isExporting ? 'Exporting...' : 'Export to ' + (state.platform === 'spotify' ? 'Spotify' : 'YouTube Music')}
          </Button>
        </div>
      </div>
    </main>
  );
}; 