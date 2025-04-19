import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createMusicService, Platform } from "../../api/musicService";
import { Logo } from "../../components/Logo";

// Platform data for mapping
const platforms = [
  {
    name: "Spotify",
    bgColor: "bg-[#073307] hover:bg-[#0a520a]",
    textColor: "text-[#031d02]",
    hoverTextColor: "group-hover:text-[#0a520a]",
    image: "/spotify-primary-logo-rgb-green-1.png",
    imageSize: "w-28 h-28",
    path: "/questions/song-count?platform=spotify"
  },
  {
    name: "YouTube Music",
    bgColor: "bg-[#900a0a] hover:bg-[#b30d0d]",
    textColor: "text-[#310404]",
    hoverTextColor: "group-hover:text-[#b30d0d]",
    image: "/youtube-music-icon-svg.png",
    imageSize: "w-[105px] h-[105px]",
    path: "/questions/song-count?platform=youtube"
  }
];

// Navigation items
const navItems = [
  { name: "How it works", isActive: false },
  { name: "Home", isActive: true },
  { name: "Contact us", isActive: false },
];

export const PlatformSelection = (): JSX.Element => {
  const navigate = useNavigate();

  const handlePlatformSelect = (path: string) => {
    const platform = path.includes('spotify') ? 'spotify' : 'youtube';
    const musicService = createMusicService(platform as Platform);
    // Store the music service in session storage for later use
    sessionStorage.setItem('musicService', JSON.stringify({ platform }));
    navigate(path, { state: { platform } });
  };

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        {/* Logo */}
        <Logo />

        {/* Navigation */}
        <motion.nav 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="w-[599px] h-[65px] bg-[#98a7754a] rounded-[40px] relative mb-14 flex justify-between items-center px-8"
        >
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className={`h-[42px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-2xl transition-all duration-200 hover:bg-transparent
                ${item.isActive 
                  ? 'text-white bg-[#acbd86]/30 px-6 rounded-full drop-shadow-[0_0_8px_rgba(172,189,134,0.8)] hover:bg-[#acbd86]/30' 
                  : 'text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'}`}
            >
              {item.name}
            </Button>
          ))}
        </motion.nav>

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
                Create a playlist on
              </h2>

              {/* Platform Buttons Container */}
              <div className="absolute w-full top-[237px] flex justify-center">
                <div className="flex items-center gap-[300px]">
                  {platforms.map((platform) => (
                    <motion.div 
                      key={platform.name} 
                      className="group flex flex-col items-center cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handlePlatformSelect(platform.path)}
                    >
                      <Button
                        className={`${platform.bgColor} w-[142px] h-36 rounded-[71px/72px] p-0 cursor-pointer relative flex items-center justify-center`}
                      >
                        <img
                          className={`${platform.imageSize} object-contain`}
                          alt={`${platform.name} logo`}
                          src={platform.image}
                        />
                      </Button>
                      <span
                        className={`mt-6 w-[222px] h-16 [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold ${platform.textColor} ${platform.hoverTextColor} text-[40px] text-center transition-colors duration-200`}
                      >
                        {platform.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
};