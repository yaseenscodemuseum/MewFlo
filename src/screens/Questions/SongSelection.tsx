import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SongSelection: React.FC = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<string[]>([]);
  const [currentSong, setCurrentSong] = useState('');

  const handleAddSong = () => {
    if (currentSong.trim()) {
      setSongs([...songs, currentSong.trim()]);
      setCurrentSong('');
    }
  };

  const handleSubmit = () => {
    navigate('/questions/next', { state: { songs } });
  };

  return (
    <div>
      <h2>Select Your Songs</h2>
      <div>
        <Input
          value={currentSong}
          onChange={(e) => setCurrentSong(e.target.value)}
          placeholder="Enter a song name"
        />
        <Button onClick={handleAddSong}>Add Song</Button>
      </div>
      <ul>
        {songs.map((song, index) => (
          <li key={index}>{song}</li>
        ))}
      </ul>
      <Button onClick={handleSubmit}>Continue</Button>
    </div>
  );
};

export default SongSelection; 