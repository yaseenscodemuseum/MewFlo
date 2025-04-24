import React from 'react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="bg-[#003526] min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[1440px] relative py-6 flex flex-col items-center">
        {/* Navigation */}
        <nav className="w-[599px] h-[65px] bg-[#98a7754a] rounded-[40px] relative mb-14 flex justify-between items-center px-8">
          <Button
            variant="ghost"
            className="h-[42px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-2xl text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            onClick={() => window.open('https://yaseensportfolio.vercel.app/', '_blank')}
          >
            Contact Us
          </Button>
          <Button
            variant="ghost"
            className="h-[42px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-2xl text-white bg-[#acbd86]/30 px-6 rounded-full drop-shadow-[0_0_8px_rgba(172,189,134,0.8)] hover:bg-[#acbd86]/30"
          >
            How it works
          </Button>
          <Button
            variant="ghost"
            className="h-[42px] [font-family:'Circular_Spotify_Text-Bold',Helvetica] font-bold text-2xl text-white/70 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            onClick={() => navigate('/')}
          >
            Home
          </Button>
        </nav>

        {/* Content Box */}
        <div className="w-[800px] bg-[#60bf79]/20 rounded-[40px] p-12 relative">
          <h1 className="text-[#60bf79] text-4xl font-bold mb-8 text-center drop-shadow-[0_0_8px_rgba(96,191,121,0.8)]">
            How it Works
          </h1>
          <p className="text-white text-xl leading-relaxed [font-family:'Circular_Spotify_Text',Helvetica]">
            Hey there! MewFlo is your personal AI DJ that creates the perfect playlist just for you. Here's the magic: 
            First, pick your favorite music platform (Spotify or YouTube Music). Then, tell us about your music taste - 
            share some songs you love, your favorite genres, and even your mood! Our AI will analyze your preferences 
            and craft a personalized playlist that matches your vibe perfectly. The best part? You can export it directly 
            to your chosen platform with just one click. No more endless scrolling - just pure, personalized music bliss!
          </p>
        </div>
      </div>
    </main>
  );
};

export default HowItWorks; 