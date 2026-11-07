import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Trophy, Home, Music } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

export default function ArcadeHeader({
  currentScreen,
  score,
  isMuted,
  onToggleMute,
  onGoHome,
}) {
  const [songName, setSongName] = useState(null);

  const handleMusicUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      audioSystem.setCustomMusic(url, file.name);
      setSongName(file.name);
      audioSystem.playClick();
      if (isMuted) onToggleMute();
      audioSystem.startMusic();
    }
  };

  return (
    <header className="arcade-header-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="audio-ctrl-btn"
          onClick={() => {
            audioSystem.playClick();
            onGoHome();
          }}
          title="Back to Home / Map"
        >
          <Home size={18} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.2rem' }}>👑</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', color: '#ffc6dc' }}>
              AKSHAYA'S EMPIRE
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px' }}>
            {currentScreen === 'welcome' && 'Home Arcade'}
            {currentScreen === 'intro' && 'Mission Briefing'}
            {currentScreen === 'level1' && 'Mission 1: Forehead Lab'}
            {currentScreen === 'level2' && 'Mission 2: Space Rescue 🚀'}
            {currentScreen === 'level3' && 'Mission 3: Delivery Dash 🛵'}
            {currentScreen === 'secret-boss' && 'Secret Mission 4: The Boss'}
            {currentScreen === 'final' && 'Grand Birthday Victory'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {songName && (
          <span
            style={{
              fontSize: '0.7rem',
              color: '#f472b6',
              fontFamily: 'var(--font-retro)',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={songName}
          >
            🎵 {songName}
          </span>
        )}

        <div className="score-display-box">
          <Trophy size={16} color="#ffd700" />
          <span className="score-val">{score} PTS</span>
        </div>

        {/* Change Background Music File Button */}
        <label
          className="audio-ctrl-btn"
          title="Choose Custom Background Music (.mp3)"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Music size={17} color="#f472b6" />
          <input
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={handleMusicUpload}
          />
        </label>

        {/* Mute/Unmute Button */}
        <button
          className="audio-ctrl-btn"
          onClick={() => {
            audioSystem.playClick();
            onToggleMute();
          }}
          title={isMuted ? 'Unmute Sound & Music' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX size={18} color="#f87171" /> : <Volume2 size={18} color="#4ade80" />}
        </button>
      </div>
    </header>
  );
}

