import React from 'react';
import { Sparkles, Compass, Rocket, Bike, Heart, PartyPopper } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';
import { fireHeartConfetti } from '../utils/confetti';

export default function WelcomeScreen({ onStartChallenge }) {
  const handleStart = () => {
    audioSystem.playClick();
    audioSystem.startMusic();
    fireHeartConfetti();
    onStartChallenge();
  };

  return (
    <div className="arcade-card animate-pulse-glow" style={{ textAlign: 'center', margin: 'auto 0' }}>
      {/* Floating Crown and Portrait */}
      <div className="portrait-hero-wrapper">
        <div className="portrait-glow-ring"></div>
        <div className="crown-badge">👑</div>
        <img
          src="/assets/akshaya-main.jpg"
          alt="Akshaya Forehead Queen"
          className="portrait-hero-img"
        />
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span className="retro-badge">ROYAL BIRTHDAY ARCADE</span>
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2.1rem, 5vw, 3.2rem)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #ffffff 0%, #ffc6dc 50%, #f472b6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.15,
          marginBottom: '10px',
        }}
      >
        HEY AKSHAYA! 🎀
      </h1>

      <p
        style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
          color: '#e9d5ff',
          maxWidth: '580px',
          margin: '0 auto 12px auto',
          lineHeight: 1.5,
          fontWeight: 600,
        }}
      >
        Welcome to the most ridiculous birthday challenge ever created!
      </p>

      <p
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.05rem, 2.8vw, 1.35rem)',
          color: '#ffd700',
          fontWeight: 700,
          marginBottom: '26px',
          textShadow: '0 2px 10px rgba(255, 215, 0, 0.4)',
        }}
      >
        Are you ready to prove that you are the FOREHEAD QUEEN? 👑✨
      </p>

      {/* Three Animated Mission Cards */}
      <div className="mission-grid">
        <div className="mission-card">
          <div className="mission-card-icon">
            <Compass size={28} color="#ff65a3" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: '#ffb3d9', marginBottom: '6px' }}>
            1. Forehead Measurement
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#d8b4fe' }}>
            Scientists & Google Maps attempt to gauge the vast territory.
          </p>
        </div>

        <div className="mission-card">
          <div className="mission-card-icon">
            <Rocket size={28} color="#a855f7" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: '#d8b4fe', marginBottom: '6px' }}>
            2. Space Rescue 🚀
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#d8b4fe' }}>
            Dodge meteors & flying slippers to defend her forehead space station!
          </p>
        </div>

        <div className="mission-card">
          <div className="mission-card-icon">
            <Bike size={28} color="#38bdf8" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: '#7dd3fc', marginBottom: '6px' }}>
            3. Delivery Dash 🛵
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#d8b4fe' }}>
            Swiggy cake delivery rush across the endless Forehead Highway!
          </p>
        </div>
      </div>

      <div style={{ marginTop: '28px' }}>
        <button className="btn-arcade" onClick={handleStart} style={{ padding: '16px 36px', fontSize: '1.25rem' }}>
          <span>START THE CHALLENGE</span>
          <span style={{ fontSize: '1.4rem' }}>🚀</span>
        </button>
      </div>

      <div style={{ marginTop: '16px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
        🔊 Tap start to enable arcade music & audio effects!
      </div>
    </div>
  );
}

