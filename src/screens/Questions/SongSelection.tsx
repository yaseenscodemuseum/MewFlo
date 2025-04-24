import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "../../components/ui/checkbox";
import { QuestionLayout } from "../../components/QuestionLayout";
import { createMusicService, Platform } from "../../api/musicService";

interface LocationState {
  songCount?: number;
  platform?: string;
}

const SongSelection: React.FC = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<string[]>([]);
  const [currentSong, setCurrentSong] = useState('');
  const [excludeSuggestions, setExcludeSuggestions] = useState(false);

  const handleAddSong = () => {
    if (currentSong.trim()) {
      setSongs([...songs, currentSong.trim()]);
      setCurrentSong('');
    }
  };

  const handleSubmit = () => {
    // Navigate to next step with songs
    navigate('/questions/next', { state: { songs } });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
    </motion.div>
  );
};

export default SongSelection; 