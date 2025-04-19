import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ReactNode } from "react";

interface QuestionLayoutProps {
  question: string;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  showSkip?: boolean;
  example?: string;
  skipText?: string;
}

export const QuestionLayout = ({
  question,
  children,
  onBack,
  onNext,
  showSkip = false,
  example,
  skipText = "Skip"
}: QuestionLayoutProps): JSX.Element => {
  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        {/* Logo */}
        <motion.h1 
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          className="[font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#acbd86] text-8xl text-center mb-16"
        >
          MewFlo
        </motion.h1>

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-[1029px] bg-[#ffd6a0] rounded-[80px] p-16"
        >
          {/* Question */}
          <h2 className="[font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#593c2d] text-6xl text-center mb-12">
            {question}
          </h2>

          {/* Example if provided */}
          {example && (
            <div className="text-center mb-8">
              <span className="text-[#593c2d] text-2xl bg-[#9b7e6f]/20 px-8 py-2 rounded-full">
                {example}
              </span>
            </div>
          )}

          {/* Content */}
          {children}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="w-full flex justify-between px-8 mt-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-[#593c2d] bg-[#9b7e6f] hover:bg-[#b39587] text-2xl px-12 py-6 rounded-2xl"
          >
            Back
          </Button>
          {showSkip ? (
            <Button
              variant="ghost"
              onClick={onNext}
              className="text-[#593c2d] bg-[#9b7e6f] hover:bg-[#b39587] text-2xl px-12 py-6 rounded-2xl"
            >
              {skipText}
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={onNext}
              className="text-[#593c2d] bg-[#9b7e6f] hover:bg-[#b39587] text-2xl px-12 py-6 rounded-2xl"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}; 