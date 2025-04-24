import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Logo } from '../../components/Logo';
import { Checkbox } from '../../components/ui/checkbox';

interface LocationState {
  songCount?: number;
  platform?: string;
}

const SongSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { songCount = 5, platform = "spotify" } = location.state as LocationState || {};
  
  const [songs, setSongs] = useState<string[]>(Array(Math.min(5, songCount)).fill(""));
  const [excludeSuggestions, setExcludeSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSongChange = (index: number, value: string) => {
    const newSongs = [...songs];
    newSongs[index] = value;
    setSongs(newSongs);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() && canAddMore) {
      handleAddSong();
    }
  };

  const handleAddSong = async () => {
    if (searchQuery.trim() && songs.filter(song => song.trim()).length < 5) {
      setIsLoading(true);
      try {
        const newSongs = [...songs];
        const emptyIndex = newSongs.findIndex(song => !song.trim());
        if (emptyIndex !== -1) {
          newSongs[emptyIndex] = searchQuery;
          setSongs(newSongs);
          setSearchQuery("");
        }
      } catch (error) {
        console.error("Error adding song:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveSong = (index: number) => {
    const newSongs = [...songs];
    newSongs[index] = "";
    setSongs(newSongs);
  };

  const handleBack = () => {
    navigate("/questions/song-count", { state: { platform } });
  };

  const handleNext = () => {
    const addedSongs = songs.filter(song => song.trim() !== "");
    if (addedSongs.length < 2) {
      alert("Please add at least 2 songs to continue");
      return;
    }
    
    navigate(`/questions/favorite-genres`, { 
      state: { 
        songCount,
        songs: addedSongs,
        excludeSuggestions,
        platform
      } 
    });
  };

  const addedSongsCount = songs.filter(song => song.trim() !== "").length;
  const canAddMore = addedSongsCount < 5;

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        {/* Logo */}
        <Logo />

        {/* Main Card */}
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
                    value={searchQuery}
                    onChange={handleSearch}
                    onKeyPress={handleKeyPress}
                    placeholder="Example: Baby - Justin Bieber"
                    className="w-[500px] h-14 bg-[#9b7e6f]/20 border-2 border-[#593c2d] text-[#593c2d] text-xl placeholder:text-[#593c2d]/50 focus:ring-2 focus:ring-[#593c2d]"
                  />
                  <Button
                    onClick={handleAddSong}
                    disabled={!searchQuery.trim() || !canAddMore || isLoading}
                    className="h-14 px-8 text-xl bg-[#9b7e6f] hover:bg-[#9b7e6f] text-[#593c2d] hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Adding..." : "Add"}
                  </Button>
                </div>

                {/* Songs List */}
                <div className="w-full space-y-4 max-h-[300px] overflow-y-auto">
                  {songs.map((song, index) => (
                    <div key={index} className="bg-[#593c2d]/10 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-[#593c2d] text-2xl font-medium">
                          {index + 1}.
                        </span>
                        <Input
                          value={song}
                          onChange={(e) => handleSongChange(index, e.target.value)}
                          placeholder={`Enter song ${index + 1}`}
                          className="flex-1 h-12 bg-transparent border-none text-[#593c2d] text-xl placeholder:text-[#593c2d]/50 focus:ring-2 focus:ring-[#593c2d]"
                        />
                        <Button
                          variant="ghost"
                          onClick={() => handleRemoveSong(index)}
                          className="text-[#593c2d] hover:bg-[#9b7e6f]/40"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Exclude Suggestions Checkbox */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="exclude-suggestions"
                    checked={excludeSuggestions}
                    onCheckedChange={(checked) => setExcludeSuggestions(checked as boolean)}
                    className="border-[#593c2d] data-[state=checked]:bg-[#593c2d] data-[state=checked]:text-[#ffd6a0]"
                  />
                  <label
                    htmlFor="exclude-suggestions"
                    className="text-[#593c2d] text-lg font-medium cursor-pointer"
                  >
                    Exclude suggested songs
                  </label>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between w-full">
                  <Button
                    onClick={handleBack}
                    className="w-[300px] h-[60px] bg-[#ffd6a0] hover:bg-[#ffd6a0] text-[#593c2d] text-xl rounded-full hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="w-[300px] h-[60px] bg-[#593c2d] hover:bg-[#593c2d] text-white text-xl rounded-full hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default SongSelection; 