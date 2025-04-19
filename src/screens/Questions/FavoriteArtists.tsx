import { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { QuestionLayout } from "../../components/QuestionLayout";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { X } from "lucide-react";

interface LocationState {
  songCount?: number;
  songs?: string[];
  excludeSuggestions?: boolean;
  excludeExplicit?: boolean;
  genres?: string[];
  platform?: string;
}

export const FavoriteArtists = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const platform = searchParams.get("platform") || (location.state as LocationState)?.platform || "unknown";
  
  const [currentArtist, setCurrentArtist] = useState("");
  const [artists, setArtists] = useState<string[]>([]);

  const handleAddArtist = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentArtist.trim()) {
      setArtists([...artists, currentArtist.trim()]);
      setCurrentArtist("");
    }
  };

  const handleRemoveArtist = (artistToRemove: string) => {
    setArtists(artists.filter(artist => artist !== artistToRemove));
  };

  const handleBack = () => {
    navigate(`/questions/favorite-genres?platform=${platform}`);
  };

  const handleNext = () => {
    const state = location.state as LocationState;
    navigate(`/questions/languages?platform=${platform}`, {
      state: {
        ...state,
        artists,
        platform
      }
    });
  };

  return (
    <QuestionLayout
      question="Which artists do you love?"
      onBack={handleBack}
      onNext={handleNext}
      showSkip={artists.length === 0}
      skipText={artists.length > 0 ? "Next" : "Skip"}
    >
      <div className="space-y-6">
        {/* Artist Input */}
        <div className="flex justify-center">
          <Input
            value={currentArtist}
            onChange={(e) => setCurrentArtist(e.target.value)}
            onKeyDown={handleAddArtist}
            placeholder="Example: Khalid, Diljit Dosanjh"
            className="w-[400px] h-12 bg-[#9b7e6f]/20 border-none text-[#593c2d] text-xl placeholder:text-[#593c2d]/50"
          />
        </div>

        {/* Artist Tags */}
        <div className="flex flex-wrap justify-center gap-3">
          {artists.map((artist) => (
            <Badge
              key={artist}
              className="bg-[#9b7e6f] hover:bg-[#b39587] text-white text-lg px-4 py-2 rounded-full flex items-center gap-2"
            >
              {artist}
              <X
                className="h-4 w-4 cursor-pointer"
                onClick={() => handleRemoveArtist(artist)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </QuestionLayout>
  );
}; 