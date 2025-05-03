import React from 'react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Logo';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        {/* Logo */}
        <Logo />

        {/* Navigation */}
        <nav className="w-[599px] h-[65px] bg-[#98a7754a] rounded-[40px] relative mb-14 flex justify-between items-center px-8">
          <Button
            variant="ghost"
            className="h-[42px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-transparent"
            onClick={() => navigate('/how-it-works')}
          >
            How it works
          </Button>
          <Button
            variant="ghost"
            className="h-[42px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-2xl text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-transparent"
            onClick={() => navigate('/')}
          >
            Home
          </Button>
          <Button
            variant="ghost"
            className="h-[42px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-2xl text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-200 hover:bg-transparent"
            onClick={() => window.open('https://yaseensportfolio.vercel.app/', '_blank')}
          >
            Contact Us
          </Button>
        </nav>

        {/* Content Box */}
        <div className="w-[800px] bg-[#60bf79]/20 rounded-[40px] p-12 relative">
          <h1 className="text-[#60bf79] text-4xl font-bold mb-8 text-center drop-shadow-[0_0_8px_rgba(96,191,121,0.8)]">
            How it Works
          </h1>
          <div className="text-white text-xl leading-relaxed [font-family:'Circular_Spotify_Text',Helvetica] space-y-4">
            <p>Hey there! MewFlo is your personal AI recommendation engine that creates the perfect playlist just for you.</p>
            <p>Here's the magic:</p>
            <p>We gather the information you provide us and then pass it on to Gemini through the Gemini API.</p>
            <p>While the AI generates the playlist, we use the Adsense API to gain some revenue from ads as an experiment.</p>
            <p>Once the playlist is generated, we use the Spotify/Yt API to export the playlist to your Spotify/Yt account.</p>
            <p>Check out my portfolio through the Contact Us button above!</p>
            <p>We hope you enjoy the service!</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HowItWorks; 