import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlatformSelection from './screens/PlatformSelection/PlatformSelection';
import { SongCount } from './screens/Questions/SongCount';
import SongSelection from './screens/Questions/SongSelection';
import { FavoriteGenres } from './screens/Questions/FavoriteGenres';
import { FavoriteArtists } from './screens/Questions/FavoriteArtists';
import { Languages } from './screens/Questions/Languages';
import { ExplicitContent } from './screens/Questions/ExplicitContent';
import { Mood } from './screens/Questions/Mood';
import { Loading } from './screens/Loading/Loading';
import Playlist from './screens/Playlist/Playlist';
import { Export } from './screens/Export/Export';
import { Callback } from './screens/Callback/Callback';
import { Success } from './screens/Success/Success';
import { Error } from './screens/Error/Error';

// Import other question screens as needed

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<PlatformSelection />} />

        {/* Required Questions */}
        <Route path="/questions/song-count" element={<SongCount />} />
        <Route path="/questions/song-selection" element={<SongSelection />} />

        {/* Optional Questions */}
        <Route path="/questions/favorite-genres" element={<FavoriteGenres />} />
        <Route path="/questions/favorite-artists" element={<FavoriteArtists />} />
        <Route path="/questions/languages" element={<Languages />} />
        <Route path="/questions/explicit-content" element={<ExplicitContent />} />
        <Route path="/questions/mood" element={<Mood />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/playlist" element={<Playlist />} />
        <Route path="/export" element={<Export />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/auth/callback" element={<Callback />} />
        <Route path="/success" element={<Success />} />
        <Route path="/error" element={<Error />} />
        {/* Add other optional question routes here */}
      </Routes>
    </Router>
  );
};

export default App; 