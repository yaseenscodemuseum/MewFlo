import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createMusicService } from '@/services/music-service';

const PlatformSelection: React.FC = () => {
  const navigate = useNavigate();

  const handlePlatformSelect = (platform: string) => {
    navigate('/questions/song-count', { state: { platform } });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2>Select Your Music Platform</h2>
      <Button onClick={() => handlePlatformSelect('spotify')}>Spotify</Button>
      <Button onClick={() => handlePlatformSelect('youtube')}>YouTube Music</Button>
    </div>
  );
};

export default PlatformSelection;