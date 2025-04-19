import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, ChangeEvent } from "react";
import { QuestionLayout } from "../../components/QuestionLayout";
import { createMusicService, Platform } from "../../api/musicService";

interface LocationState {
  songCount?: number;
  platform?: string;
}

export const SongSelection = (): JSX.Element => {
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

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
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
    
    navigate(`/questions/favorite-genres?platform=${platform}`, { 
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
    <QuestionLayout
      question="What are some songs you like listening to?"
      onBack={handleBack}
      onNext={handleNext}
      showSkip={addedSongsCount === 0}
      skipText={addedSongsCount > 0 ? "Next" : "Skip"}
    >
      <div className="space-y-6">
        {/* Search Section */}
        <div className="mb-6">
          <div className="flex justify-center gap-4">
            <Input
              value={searchQuery}
              onChange={handleSearch}
              onKeyPress={handleKeyPress}
              placeholder="Example: Baby - Justin Bieber"
              className="w-[500px] h-14 bg-[#9b7e6f]/20 border-2 border-[#593c2d] text-[#593c2d] text-xl placeholder:text-[#593c2d]/50 focus:ring-2 focus:ring-[#593c2d]"
            />
            <Button
              onClick={handleAddSong}
              disabled={!searchQuery.trim() || !canAddMore}
              className="h-14 px-8 text-xl bg-[#9b7e6f] hover:bg-[#b39587] text-[#593c2d] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </Button>
          </div>
          {isLoading && (
            <div className="text-center mt-4">
              <span className="text-[#593c2d] text-xl">Adding song...</span>
            </div>
          )}
          <div className="text-center mt-2">
            <span className="text-[#593c2d] text-lg">
              {canAddMore 
                ? `Add up to ${5 - addedSongsCount} more songs (minimum 2 required)`
                : "Maximum 5 songs reached"}
            </span>
          </div>
        </div>

        {/* Checkbox */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="suggestions" 
              checked={excludeSuggestions}
              onCheckedChange={(checked: boolean) => setExcludeSuggestions(checked)}
            />
            <label
              htmlFor="suggestions"
              className="text-[#593c2d] text-xl font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Don't include my suggestions
            </label>
          </div>
        </div>

        {/* Added Songs List */}
        <div className="space-y-4">
          <h3 className="[font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#593c2d] text-3xl mb-4">
            Songs added ({addedSongsCount}/5):
          </h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-4">
            {songs.map((song, index) => (
              <div key={index} className="flex items-center gap-4 bg-[#9b7e6f]/20 p-4 rounded-lg">
                <span className="text-[#593c2d] text-2xl font-medium">
                  {index + 1}.
                </span>
                <Input
                  value={song}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleSongChange(index, e.target.value)}
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
            ))}
          </div>
        </div>
      </div>
    </QuestionLayout>
  );
}; 