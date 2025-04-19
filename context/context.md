# MewFlo Web App Specification

## Project Summary

MewFlo is a free web app that generates personalized playlists for users based on their music tastes using AI. The user answers a few lightweight questions, selects a platform (Spotify, Apple Music, or YouTube Music), and MewFlo delivers a custom playlist of up to 25 songs. It supports monetization via Google AdSense and delivers smooth transitions using Framer Motion.

---

## Monetization

- Google AdSense:
  - One or two static ads on main pages
  - One ad shown while the playlist is being generated

---

## Features

- AI-generated playlists with a cap of 25 songs
- Multiple platform support: Spotify, Apple Music, YouTube Music
- Users can scroll and select songs using API-based search (for "Songs You Like")
- Auto-detection of genre, mood, and language where needed
- Animated and smooth UI transitions using Framer Motion
- Separate pages/screens for each question with skip functionality for optional ones
- Playlist title suggestions based on selected songs and mood
- Optional use of OpenAI and Gemini — fallback logic to show at least one result

---

## Tech Stack

**Frontend:**
- HTML, CSS (no Tailwind)
- JavaScript or React (if needed for state/routing)
- Framer Motion for transitions

**Backend (optional):**
- Node.js + Express (recommended for secure API proxy)
- Or serverless (Vercel/Netlify/Firebase Functions)

**Hosting:**
- Vercel, Netlify, or GitHub Pages

---

## APIs Required

### 1. Gemini API (Google AI)
- Used to generate playlists based on user preferences

### 2. OpenAI API (GPT-3.5/GPT-4 Free Tier)
- Optional: Generate alternative playlist with fallback support

### 3. Spotify Web API
- Requires OAuth
- Enables playlist creation

### 4. YouTube Data API
- Allows song search and URL generation
- Playlist creation might need manual URL stitching

### 5. Apple Music API + MusicKit JS
- Requires developer account
- Allows playlist creation if user is logged in

### 6. Google AdSense
- For displaying ads

---

## Playlist Flow

1. **Landing Page**
   - Branding, explanation, platform selection
   - Built using Figma design

2. **Questions (Each on Separate Screens)**

   **Required (first):**
   - How many songs do you want? (5–25) — dropdown or slider
   - Songs you enjoy or want included — API-powered search or tag input (up to 10)

   **Optional (skippable with button):**
   - Playlists you like — multi-line or link input
   - Favorite genres — text or tag input (auto-detect fallback)
   - Artists you love — text or tag input
   - Languages you prefer — text input
   - Should explicit songs be allowed? — checkbox or toggle
   - Describe the vibe or mood you're going for — open-ended input

3. **Platform Selection**
   - User chooses one: Spotify, YouTube Music, or Apple Music
   - Stored in state; platform selection already designed in Figma

4. **Loading Screen**
   - Shows loading animation with an ad (Google AdSense)
   - Transitions into final screen

5. **Final Screen**

   - Two playlists generated:
     - One using **Gemini API**
     - One using **OpenAI API**
   - If both succeed: user can switch/toggle between them
   - If only one succeeds: show only the working playlist
   - If both fail: show fallback error and retry button

   - Suggested playlist titles shown based on mood and songs:
     - Examples:
       - Midnight Flow
       - Golden Hour Hits
       - Dreamwave Sessions

   - User can:
     - Copy playlist
     - Export to selected platform (Spotify, Apple Music, YouTube Music)
     - Share via link

---

## Developer Notes

- Use Framer Motion for all screen transitions
- Keep Gemini/OpenAI prompt logic modular and resilient
- Ensure clear error handling if APIs fail or limit usage
- Prevent exceeding 25 songs total (user input + suggestions)
- Separate logic per music platform with failover in UI
- Include fallback message if Apple Music API integration is limited due to cost

---

## Status

- Landing page design ready in Figma
- Scrollable song selection UI planned
- Platform selection screen designed
- Development ready to begin

