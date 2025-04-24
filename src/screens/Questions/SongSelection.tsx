import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

const SongSelection: React.FC = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<string[]>([]);
  const [currentSong, setCurrentSong] = useState('');

  const handleAddSong = () => {
    if (currentSong.trim()) {
      setSongs([...songs, currentSong.trim()]);
      setCurrentSong('');
    }
  };

  const handleSubmit = () => {
    navigate('/questions/next', { state: { songs } });
  };

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        <Card className="w-[1029px] h-[618px] bg-[#ffd6a0] rounded-[80px] border-none relative">
          <CardContent className="p-0">
            <h2 className="absolute w-[898px] h-44 top-[13px] left-[60px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#593c2d] text-[80px] text-center">
              Select Your Songs
            </h2>
            <div className="absolute w-full top-[237px] flex flex-col items-center">
              <div className="w-[800px] flex flex-col items-center gap-8">
                {/* Search Section */}
                <div className="w-full flex justify-center gap-4">
                  <Input
                    value={currentSong}
                    onChange={(e) => setCurrentSong(e.target.value)}
                    placeholder="Enter a song name"
                    className="w-[500px] h-14 bg-[#9b7e6f]/20 border-2 border-[#593c2d] text-[#593c2d] text-xl placeholder:text-[#593c2d]/50 focus:ring-2 focus:ring-[#593c2d]"
                  />
                  <Button
                    onClick={handleAddSong}
                    className="h-14 px-8 text-xl bg-[#9b7e6f] hover:bg-[#9b7e6f] text-[#593c2d] hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200"
                  >
                    Add
                  </Button>
                </div>

                {/* Songs List */}
                <div className="w-full space-y-4 max-h-[300px] overflow-y-auto">
                  {songs.map((song, index) => (
                    <div key={index} className="bg-[#593c2d]/10 p-4 rounded-lg">
                      <p className="text-[#593c2d] text-xl font-medium">{song}</p>
                    </div>
                  ))}
                </div>

                {/* Continue Button */}
                <Button
                  onClick={handleSubmit}
                  className="w-[300px] h-[60px] bg-[#593c2d] hover:bg-[#593c2d] text-white text-xl rounded-full hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200"
                >
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default SongSelection; 