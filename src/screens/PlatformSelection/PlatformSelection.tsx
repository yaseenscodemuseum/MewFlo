import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Logo } from '../../components/Logo';

const PlatformSelection: React.FC = () => {
  const navigate = useNavigate();

  const handlePlatformSelect = (platform: string) => {
    navigate('/questions/song-count', { state: { platform } });
  };

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        {/* Logo */}
        <Logo />

        {/* Navigation */}
        <nav className="w-[599px] h-[65px] bg-[#98a7754a] rounded-[40px] relative mb-14 flex justify-between items-center px-8">
          <Button
            variant="ghost"
            className="h-[42px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-2xl text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200"
            onClick={() => navigate('/how-it-works')}
          >
            How it works
          </Button>
          <Button
            variant="ghost"
            className="h-[42px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200"
          >
            Home
          </Button>
          <Button
            variant="ghost"
            className="h-[42px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-2xl text-white/70 hover:text-[#1DB954] hover:drop-shadow-[0_0_8px_rgba(29,185,84,0.8)] transition-all duration-200"
            onClick={() => window.open('https://yaseensportfolio.vercel.app/', '_blank')}
          >
            Contact Us
          </Button>
        </nav>

        {/* Main Card */}
        <div className="w-[1029px] h-[618px] bg-[#ffd6a0] rounded-[80px] border-none relative">
          <h2 className="absolute w-[898px] h-44 top-[13px] left-[60px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-[#593c2d] text-[80px] text-center">
            Create a playlist on
          </h2>
          <div className="absolute w-full top-[237px] flex justify-center">
            <div className="flex items-center gap-[300px]">
              <div className="flex flex-col items-center group">
                <Button
                  className="w-[142px] h-36 rounded-[71px/72px] bg-[#073307] hover:bg-[#0a520a] p-0 transition-all duration-200"
                  onClick={() => handlePlatformSelect('spotify')}
                >
                  <img
                    className="w-28 h-28 object-contain group-hover:drop-shadow-[0_0_8px_rgba(29,185,84,0.8)] transition-all duration-200"
                    alt="Spotify logo"
                    src="/spotify-primary-logo-rgb-green-1.png"
                  />
                </Button>
                <span className="mt-6 text-[#073307] text-4xl font-bold group-hover:text-[#1DB954] group-hover:drop-shadow-[0_0_8px_rgba(29,185,84,0.8)] transition-all duration-200">
                  Spotify
                </span>
              </div>
              <div className="flex flex-col items-center group">
                <Button
                  className="w-[142px] h-36 rounded-[71px/72px] bg-[#900a0a] hover:bg-[#b30d0d] p-0 transition-all duration-200"
                  onClick={() => handlePlatformSelect('youtube')}
                >
                  <img
                    className="w-[105px] h-[105px] object-contain group-hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] transition-all duration-200"
                    alt="YouTube Music logo"
                    src="/youtube-music-icon-svg.png"
                  />
                </Button>
                <span className="mt-6 text-[#900a0a] text-4xl font-bold group-hover:text-[#FF0000] group-hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] transition-all duration-200">
                  YouTube Music
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PlatformSelection;