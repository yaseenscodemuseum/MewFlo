import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { X } from "lucide-react";
import { Logo } from "../../components/Logo";

interface LocationState {
  platform: string;
  genres: string[];
  artists: string[];
  languages: string[];
  explicit: boolean;
  songs: string[];
}

export const Mood = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [currentMood, setCurrentMood] = useState("");
  const [moods, setMoods] = useState<string[]>([]);

  const handleAddMood = () => {
    if (currentMood.trim() && !moods.includes(currentMood.trim())) {
      setMoods([...moods, currentMood.trim()]);
      setCurrentMood("");
    }
  };

  const handleRemoveMood = (moodToRemove: string) => {
    setMoods(moods.filter(mood => mood !== moodToRemove));
  };

  const handleNext = () => {
    navigate("/loading", {
      state: {
        ...state,
        moods,
      },
    });
  };

  const handleBack = () => {
    navigate("/questions/explicit-content", {
      state: state,
    });
  };

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        <Logo />
        <Card className="w-[1029px] h-[618px] bg-[#ffd6a0] rounded-[80px] border-none relative">
          <CardContent className="p-0">
            <h2 className="absolute w-[898px] h-44 top-[13px] left-[60px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#593c2d] text-[80px] text-center">
              What's Your Mood?
            </h2>
            <div className="absolute w-full top-[237px] flex flex-col items-center">
              <div className="w-[800px] flex flex-col items-center gap-8">
                <div className="w-full flex gap-4">
                  <input
                    type="text"
                    value={currentMood}
                    onChange={(e) => setCurrentMood(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMood()}
                    placeholder="Example: Workout, Chill, Sad, Happy"
                    className="w-full h-[60px] bg-white/50 border-2 border-[#593c2d]/20 rounded-full px-8 text-[#593c2d] text-xl focus:outline-none focus:border-[#593c2d] placeholder:text-[#593c2d]/50"
                  />
                  <Button
                    onClick={handleAddMood}
                    className="w-32 h-[60px] bg-[#593c2d] hover:bg-[#593c2d]/90 text-white text-xl rounded-full"
                  >
                    Add
                  </Button>
                </div>
                <div className="w-full flex flex-wrap gap-2">
                  {moods.map((mood, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-[#593c2d]/20 text-[#593c2d] text-lg px-4 py-2 rounded-full hover:bg-[#593c2d]/30"
                    >
                      {mood}
                      <button
                        onClick={() => handleRemoveMood(mood)}
                        className="ml-2 hover:text-[#593c2d]/80"
                      >
                        <X size={16} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute bottom-8 left-0 right-0 flex justify-between px-16">
              <Button
                onClick={handleBack}
                className="w-[200px] h-[60px] bg-[#593c2d] hover:bg-[#593c2d]/90 text-white text-xl rounded-full"
              >
                Back
              </Button>
              <div className="flex gap-4">
                {moods.length > 0 ? (
                  <Button
                    onClick={handleNext}
                    className="w-[200px] h-[60px] bg-[#593c2d] hover:bg-[#593c2d]/90 text-white text-xl rounded-full"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate("/loading", { state: { ...state, moods: [] } })}
                    className="w-[200px] h-[60px] bg-[#593c2d]/20 hover:bg-[#593c2d]/30 text-[#593c2d] text-xl rounded-full"
                  >
                    Skip
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}; 