import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Logo } from "../../components/Logo";
import { Platform } from "../../api/musicService";

interface LocationState {
  platform: Platform;
}

export const SongCount = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [selectedCount, setSelectedCount] = useState<string>("");
  const songCounts = Array.from({ length: 21 }, (_, i) => i + 5); // 5 to 25

  const handleNext = () => {
    navigate("/questions/song-selection", { state: { songCount: selectedCount, platform: state.platform } });
  };

  const handleBack = () => {
    navigate("/", { state: { platform: state.platform } });
  };

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        {/* Logo */}
        <Logo />

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-[1029px] bg-[#ffd6a0] rounded-[80px] p-16"
        >
          {/* Question */}
          <h2 className="[font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#593c2d] text-6xl text-center mb-12">
            How many songs do you want your playlist to have?
          </h2>

          {/* Dropdown */}
          <div className="flex justify-center">
            <Select value={selectedCount} onValueChange={setSelectedCount}>
              <SelectTrigger className="w-[400px] h-16 bg-[#9b7e6f]/80 text-white text-2xl rounded-xl border-2 border-[#593c2d] hover:bg-[#9b7e6f] transition-colors">
                <SelectValue placeholder="Select number of songs (05 - 25)" />
              </SelectTrigger>
              <SelectContent className="bg-[#9b7e6f]/90 backdrop-blur-sm border-2 border-[#593c2d] max-h-[300px] overflow-y-auto">
                {songCounts.map((count) => (
                  <SelectItem 
                    key={count} 
                    value={count.toString()}
                    className="text-xl text-white hover:bg-[#593c2d] cursor-pointer"
                  >
                    {count.toString().padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Navigation Buttons */}
          <div className="w-full flex justify-between px-8 mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-[#593c2d] bg-[#9b7e6f] hover:bg-[#b39587] text-2xl px-12 py-6 rounded-2xl transition-colors"
            >
              Back
            </Button>
            <Button
              variant="ghost"
              onClick={handleNext}
              disabled={!selectedCount}
              className={`text-[#593c2d] bg-[#9b7e6f] hover:bg-[#b39587] text-2xl px-12 py-6 rounded-2xl transition-colors ${
                !selectedCount ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Next
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}; 