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
  genres?: string[];
  artists?: string[];
  platform?: string;
}

export const Languages = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const platform = searchParams.get("platform") || (location.state as LocationState)?.platform || "unknown";
  
  const [currentLanguage, setCurrentLanguage] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);

  const addLanguage = () => {
    if (currentLanguage.trim()) {
      setLanguages([...languages, currentLanguage.trim()]);
      setCurrentLanguage("");
    }
  };

  const handleAddLanguage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addLanguage();
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    setLanguages(languages.filter(language => language !== languageToRemove));
  };

  const handleBack = () => {
    navigate(`/questions/favorite-artists?platform=${platform}`);
  };

  const handleNext = () => {
    const state = location.state as LocationState;
    navigate(`/questions/explicit-content?platform=${platform}`, {
      state: {
        ...state,
        languages,
        platform
      }
    });
  };

  return (
    <QuestionLayout
      question="What languages do you prefer in your music?"
      onBack={handleBack}
      onNext={handleNext}
      showSkip={languages.length === 0}
      skipText={languages.length > 0 ? "Next" : "Skip"}
    >
      <div className="space-y-6">
        {/* Language Input */}
        <div className="flex justify-center gap-4">
          <Input
            value={currentLanguage}
            onChange={(e) => setCurrentLanguage(e.target.value)}
            onKeyDown={handleAddLanguage}
            placeholder="Example: English, Hindi"
            className="w-[400px] h-12 bg-[#9b7e6f]/20 border-none text-[#593c2d] text-xl placeholder:text-[#593c2d]/50"
          />
          <Button
            onClick={addLanguage}
            disabled={!currentLanguage.trim()}
            className="h-12 px-8 text-xl bg-[#9b7e6f] hover:bg-[#9b7e6f] text-[#593c2d] hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </Button>
        </div>

        {/* Language Tags */}
        <div className="flex flex-wrap justify-center gap-3">
          {languages.map((language) => (
            <Badge
              key={language}
              className="bg-[#9b7e6f] hover:bg-[#b39587] text-white text-lg px-4 py-2 rounded-full flex items-center gap-2"
            >
              {language}
              <X
                className="h-4 w-4 cursor-pointer"
                onClick={() => handleRemoveLanguage(language)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </QuestionLayout>
  );
}; 