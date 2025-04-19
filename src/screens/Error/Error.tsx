import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Logo } from "../../components/Logo";

interface LocationState {
  error?: string;
}

export const Error = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const errorMessage = state?.error || "An unexpected error occurred";

  const handleRetry = () => {
    navigate("/");
  };

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        <Logo />
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Card className="w-[1029px] h-[618px] bg-[#ffd6a0] rounded-[80px] border-none relative">
            <CardContent className="p-0">
              <h2 className="absolute w-[898px] h-44 top-[100px] left-[60px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#593c2d] text-[50px] text-center">
                Oops! Something went wrong
              </h2>
              <div className="absolute w-full top-[237px] flex flex-col items-center">
                <div className="w-[800px] flex flex-col items-center gap-8">
                  <div className="text-center">
                    <p className="absolute w-full top-[-50px] right-[0px] text-[#593c2d] text-2xl mb-4">
                      We encountered an error while processing your request: <b>[{errorMessage}]</b> 
                    </p>
                  </div>
                  <Button
                    onClick={handleRetry}
                    className="w-[300px] h-[60px] bg-[#593c2d] hover:bg-[#593c2d]/90 text-white text-xl rounded-full"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}; 