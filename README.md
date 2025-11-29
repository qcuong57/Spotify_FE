# 🎵 UIA Music - Online Music Streaming Platform

![Project Status](https://img.shields.io/badge/Status-Development-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Mantine UI](https://img.shields.io/badge/Mantine-339AF0?style=for-the-badge&logo=mantine&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**UIA Music** is a modern Single Page Application (SPA) for music streaming, built with a focus on seamless user experience (UX). The project features a robust **Dynamic Theming** system, professional audio handling, and a karaoke-style **Synced Lyrics** engine.

---

## ✨ Key Features

### 🎧 User Portal (For Listeners)

* **Advanced Music Player:**
    * Full playback controls: Play, Pause, Next, Prev, Shuffle, Repeat (One/All).
    * **Expanded View:** Full-screen mode with dynamic backgrounds based on color gradients.
    * **Media Session API:** Control music playback directly from the lock screen or notification center (iOS/Android supported).
    * Smooth draggable Progress Bar for both mobile and desktop.

* **Synced Lyrics (Karaoke Style):**
    * Real-time synchronized lyrics display (LRC format).
    * **Smooth Scrolling:** Powered by `requestAnimationFrame` for buttery smooth lyric transitions.
    * **Seek-to-Lyric:** Interactive lines – tap any lyric line to jump the audio to that exact timestamp.

* **Dynamic Theming System:**
    * Supports 9+ unique themes: **Pixel Cyberpunk, Cherry Blossom, Ocean, Forest, Sunset, etc.**
    * Each theme completely transforms the color palette, background images, and enables floating **particle effects**.

* **Personal Library:**
    * Create, edit, and delete personal Playlists.
    * "Liked Songs" collection.
    * **Enhanced Context Menu:** Custom right-click menu for quick actions (Add to playlist, Like, etc.).
    * Smart Search with suggestions for songs and artists.

### 🛠 Admin Portal (For Administrators)

* **Management Dashboard:** Intuitive interface with a collapsible Sidebar.
* **Song Management (CRUD):**
    * Add, Edit, Delete songs.
    * Multimedia upload support: Audio, Cover Image, Video.
    * **Professional Lyrics Editor:** Built-in tool to author synchronized lyrics with 3 modes:
        * *Timeline Editor:* Drag-and-drop timing.
        * *Raw LRC:* Edit source code directly.
        * *Plain Text:* Simple text entry.
* **System Management:**
    * **Users:** Manage user accounts and statuses (Active/Banned).
    * **Genres & Playlists:** Manage system-wide categories and collections.

---

## 🛠 Tech Stack

The project is built entirely on **React** and optimizes performance using **Context API** instead of Redux.

| Area | Technology / Library | Details |
| :--- | :--- | :--- |
| **Core** | React.js (Vite) | High-performance Frontend Framework |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | Mantine UI | Powerful component library (Modals, Tables, Forms) |
| **Animations** | Framer Motion | Smooth transitions and micro-interactions |
| **State Management** | Context API | Global state for Audio, Auth, Theme, and Playlist |
| **Networking** | Axios | Custom HTTP client with Interceptors for JWT handling |
| **Routing** | React Router DOM | Client-side routing and Protected Routes |
| **Icons** | Tabler Icons | Consistent and modern icon set |
| **Utils** | Hls.js, jwt-decode | Video streaming support and Token decoding |

---

## 📂 Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── admin/           # Admin-specific components (Table, Form, LyricsEditor...)
│   ├── auth/            # Authentication components (Login, SignUp...)
│   ├── user/            # User-facing components (Player, Library, SongCard...)
│   └── ...
├── context/             # Global State (Context API)
│   ├── auth/            # AuthContext (User, Token)
│   ├── themeContext.js  # Theme & Color management
│   └── ...
├── services/            # API Service Layer (Axios)
│   ├── authService.js
│   ├── SongsService.js
│   └── ...
├── utils/               # Utilities & Custom Hooks
│   ├── audioContext.jsx # Core Audio Player Logic
│   ├── axiosCustom.js   # Axios Interceptors Configuration
│   └── ...
├── App.jsx              # Main Layout & Routing
└── main.jsx             # Entry point
```
