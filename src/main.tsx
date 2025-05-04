import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { inject } from '@vercel/analytics';
import App from './App';
import './index.css';

// Initialize Vercel Analytics
inject();

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
); 