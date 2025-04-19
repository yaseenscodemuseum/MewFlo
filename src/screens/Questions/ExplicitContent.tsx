import { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { QuestionLayout } from "../../components/QuestionLayout";
import { Checkbox } from "../../components/ui/checkbox";

interface LocationState {
  songCount?: number;
  songs?: string[];
  excludeSuggestions?: boolean;
  genres?: string[];
  artists?: string[];
  languages?: string;
}

export const ExplicitContent = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const platform = searchParams.get("platform");
  
  const [allowExplicit, setAllowExplicit] = useState(false);

  const handleBack = () => {
    navigate(`/questions/languages?platform=${platform}`);
  };

  const handleNext = () => {
    const state = location.state as LocationState;
    navigate(`/questions/mood?platform=${platform}`, {
      state: {
        allowExplicit,
        ...state
      }
    });
  };

  return (
    <QuestionLayout
      question="Do you want to include explicit songs?"
      onBack={handleBack}
      onNext={handleNext}
      showSkip={false}
    >
      <div className="flex justify-center">
        <div className="flex items-center gap-4">
          <Checkbox 
            id="explicit" 
            checked={allowExplicit}
            onCheckedChange={(checked: boolean) => setAllowExplicit(checked)}
            className="h-6 w-6 border-2 border-[#593c2d] data-[state=checked]:bg-[#593c2d]"
          />
          <label
            htmlFor="explicit"
            className="text-[#593c2d] text-2xl font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Yes, include explicit songs
          </label>
        </div>
      </div>
    </QuestionLayout>
  );
}; 