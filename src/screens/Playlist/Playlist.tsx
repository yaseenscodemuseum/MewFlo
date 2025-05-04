import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Logo } from '../../components/Logo';
import { Card, CardContent } from '../../components/ui/card';

interface PlaylistItem {
  title: string;
  artist: string;
  reason: string;
}

const Playlist: React.FC = () => {
  const location = useLocation();
  const { primary } = location.state || { primary: [] };

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
                  {primary.map((song: PlaylistItem, index: number) => (
                    <div key={index} className="bg-[#593c2d]/10 p-4 rounded-lg">
                      <h3 className="text-[#593c2d] text-xl font-bold">{song.title}</h3>
                      <p className="text-[#593c2d]/80">{song.artist}</p>
                      <p className="text-[#593c2d]/60 text-sm mt-2">{song.reason}</p>
                    </div>
                  ))}
                </div>

                {/* Export Button */}
                <Button
                  className="w-[300px] h-[60px] bg-[#593c2d] hover:bg-[#6b4a3a] text-white text-xl rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(89,60,45,0.5)]"
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