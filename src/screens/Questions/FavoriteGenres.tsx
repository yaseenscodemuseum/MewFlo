import { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { QuestionLayout } from "../../components/QuestionLayout";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { X } from "lucide-react";

interface LocationState {
  songCount?: number;
  songs?: string[];
  excludeSuggestions?: boolean;
  excludeExplicit?: boolean;
  platform?: string;
}

export const FavoriteGenres = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const platform = searchParams.get("platform") || (location.state as LocationState)?.platform || "unknown";
  
  const [currentGenre, setCurrentGenre] = useState("");
  const [genres, setGenres] = useState<string[]>([]);

  const addGenre = () => {
    if (currentGenre.trim()) {
      setGenres([...genres, currentGenre.trim()]);
      setCurrentGenre("");
    }
  };

  const handleAddGenre = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addGenre();
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setGenres(genres.filter(genre => genre !== genreToRemove));
  };

  const handleBack = () => {
    navigate(`/questions/song-selection?platform=${platform}`);
  };

  const handleNext = () => {
    const state = location.state as LocationState;
    navigate(`/questions/favorite-artists?platform=${platform}`, {
      state: {
        ...state,
        genres,
        platform
      }
    });
  };

  return (
    <QuestionLayout
      question="What genres do you enjoy?"
      onBack={handleBack}
      onNext={handleNext}
      showSkip={genres.length === 0}
      skipText={genres.length > 0 ? "Next" : "Skip"}
    >
      <div className="space-y-6">
        {/* Genre Input */}
        <div className="flex justify-center gap-4">
          <Input
            value={currentGenre}
            onChange={(e) => setCurrentGenre(e.target.value)}
            onKeyDown={handleAddGenre}
            placeholder="Example: Pop, Rock"
            className="w-[400px] h-12 bg-[#9b7e6f]/20 border-none text-[#593c2d] text-xl placeholder:text-[#593c2d]/50"
          />
          <Button
            onClick={addGenre}
            disabled={!currentGenre.trim()}
            className="h-12 px-8 text-xl bg-[#9b7e6f] hover:bg-[#9b7e6f] text-[#593c2d] hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </Button>
        </div>

        {/* Genre Tags */}
        <div className="flex flex-wrap justify-center gap-3">
          {genres.map((genre) => (
            <Badge
              key={genre}
              className="bg-[#9b7e6f] hover:bg-[#b39587] text-white text-lg px-4 py-2 rounded-full flex items-center gap-2"
            >
              {genre}
              <X
                className="h-4 w-4 cursor-pointer"
                onClick={() => handleRemoveGenre(genre)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </QuestionLayout>
  );
}; 