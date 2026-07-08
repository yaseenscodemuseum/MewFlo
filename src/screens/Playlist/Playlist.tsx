import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { primary, platform } = location.state || { primary: [], platform: 'spotify' };

  const handleExport = () => {
    navigate('/export', {
      state: {
        platform,
        primary,
        secondary: null
      }
    });
  };

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        <Logo />

        <Card className="w-[1029px] bg-[#ffd6a0] rounded-[80px] border-none">
          <CardContent className="p-0 flex flex-col items-center">
            <h2 className="w-[898px] pt-[30px] pb-4 [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#593c2d] text-[70px] text-center leading-tight">
              Your Playlist
            </h2>

            <div className="w-[800px] space-y-3 max-h-[400px] overflow-y-auto px-4 pb-8">
              {primary.map((song: PlaylistItem, index: number) => (
                <div key={index} className="bg-[#593c2d]/10 p-4 rounded-lg">
                  <h3 className="text-[#593c2d] text-xl font-bold">{song.title}</h3>
                  <p className="text-[#593c2d]/80">{song.artist}</p>
                  <p className="text-[#593c2d]/60 text-sm mt-1">{song.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          className="mt-8 w-[300px] h-[60px] bg-[#593c2d] hover:bg-[#6b4a3a] text-white text-xl rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(89,60,45,0.5)]"
          onClick={handleExport}
        >
          Export to {platform === 'spotify' ? 'Spotify' : 'YouTube Music'}
        </Button>
      </div>
    </main>
  );
};

export default Playlist;
