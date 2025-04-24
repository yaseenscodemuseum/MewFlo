import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Playlist: React.FC = () => {
  const location = useLocation();
  const { songs } = location.state || { songs: [] };

  return (
    <div>
      <h2>Your Playlist</h2>
      <ul>
        {songs.map((song: string, index: number) => (
          <li key={index}>{song}</li>
        ))}
      </ul>
      <Button>Export Playlist</Button>
    </div>
  );
};

export default Playlist; 