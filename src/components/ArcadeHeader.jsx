import React from 'react';
import { Volume2, VolumeX, Trophy, Home } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

export default function ArcadeHeader({
  currentScreen,
  score,
  isMuted,
  onToggleMute,
  onGoHome,
}) {
  return (
    <header className="arcade-header-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            <span style={{ fontSize: '1.15rem' }}>👑</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.98rem', color: '#ffc6dc' }}>
              AKSHAYA'S EMPIRE
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.4px' }}>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="score-display-box" style={{ padding: '5px 10px' }}>
          <Trophy size={15} color="#ffd700" />
          <span className="score-val" style={{ fontSize: '0.85rem' }}>{score} PTS</span>
        </div>

        {/* Mute/Unmute Button */}
        <button
          className="audio-ctrl-btn"
          onClick={() => {
            audioSystem.playClick();
            onToggleMute();
          }}
          title={isMuted ? 'Unmute Sound & Music' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX size={17} color="#f87171" /> : <Volume2 size={17} color="#4ade80" />}
        </button>
      </div>
    </header>
  );
}

