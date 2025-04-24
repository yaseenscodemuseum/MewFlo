import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Logo } from '../../components/Logo';
import { Card, CardContent } from '../../components/ui/card';

const Playlist: React.FC = () => {
  const location = useLocation();
  const { songs } = location.state || { songs: [] };

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        {/* Logo */}
        <Logo />

        {/* Main Card */}
        <Card className="w-[1029px] h-[618px] bg-[#ffd6a0] rounded-[80px] border-none relative">
          <CardContent className="p-0">
            <h2 className="absolute w-[898px] h-44 top-[13px] left-[60px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#593c2d] text-[80px] text-center">
              Your Playlist
            </h2>
            <div className="absolute w-full top-[237px] flex flex-col items-center">
              <div className="w-[800px] flex flex-col items-center gap-8">
                {/* Songs List */}
                <div className="w-full space-y-4 max-h-[300px] overflow-y-auto">
                  {songs.map((song: string, index: number) => (
                    <div key={index} className="bg-[#593c2d]/10 p-4 rounded-lg">
                      <p className="text-[#593c2d] text-xl font-medium">{song}</p>
                    </div>
                  ))}
                </div>

                {/* Export Button */}
                <Button
                  className="w-[300px] h-[60px] bg-[#593c2d] hover:bg-[#593c2d] text-white text-xl rounded-full hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200"
                >
                  Export Playlist
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Playlist; 