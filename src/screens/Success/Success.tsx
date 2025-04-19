import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Logo } from "../../components/Logo";

export const Success = (): JSX.Element => {
  const navigate = useNavigate();

  const handleNewPlaylist = () => {
    navigate('/');
  };

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        {/* Logo */}
        <Logo />

        {/* Main Card */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          <Card className="w-[1029px] h-[618px] bg-[#ffd6a0] rounded-[80px] border-none relative">
            <CardContent className="p-0">
              {/* Card Title */}
              <h2 className="absolute w-[898px] h-44 top-[13px] left-[60px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#593c2d] text-[80px] text-center">
                Playlist Exported!
              </h2>

              {/* Content */}
              <div className="absolute w-full top-[237px] flex flex-col items-center">
                <div className="w-[800px] flex flex-col items-center gap-8">
                  <p className="text-[#593c2d] text-2xl text-center">
                    Your playlist has been successfully exported to your account. You can now find it in your library.
                  </p>

                  <div className="flex flex-col items-center gap-4">
                    <Button
                      onClick={handleNewPlaylist}
                      className="w-[300px] h-[60px] bg-[#593c2d] hover:bg-[#593c2d]/90 text-white text-xl rounded-full"
                    >
                      Create New Playlist
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}; 