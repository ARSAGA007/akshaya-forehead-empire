import React from 'react';
import { AlertCircle, Flame, Check, ShieldAlert } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

export default function IntroductionScreen({ onAcceptMission }) {
  const handleAccept = () => {
    audioSystem.playClick();
    audioSystem.playScanBeep();
    onAcceptMission();
  };

  return (
    <div className="arcade-card" style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
      {/* Breaking News Ticker Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(90deg, #dc2626, #ef4444)',
          color: '#fff',
          padding: '6px 16px',
          borderRadius: '9999px',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          fontSize: '0.95rem',
          letterSpacing: '1px',
          marginBottom: '16px',
          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
        }}
      >
        <span style={{ animation: 'wiggle 1s infinite' }}>🚨</span>
        <span>BREAKING NEWS BULLETIN</span>
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
          fontWeight: 800,
          color: '#ffd700',
          marginBottom: '14px',
          textShadow: '0 2px 12px rgba(255, 215, 0, 0.3)',
        }}
      >
        AN UNPRECEDENTED DISCOVERY!
      </h2>

      {/* Picture Frame with playful photo */}
      <div
        style={{
          width: '160px',
          height: '160px',
          margin: '0 auto 18px auto',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '3px solid #ff65a3',
          boxShadow: '0 8px 24px rgba(255, 101, 163, 0.35)',
        }}
      >
        <img
          src="/assets/akshaya-photo-2.jpg"
          alt="Akshaya Discovered"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div
        style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '18px',
          padding: '18px 20px',
          textAlign: 'left',
          marginBottom: '24px',
          lineHeight: '1.7',
          fontSize: '1rem',
          color: '#f3e8ff',
        }}
      >
        <p style={{ marginBottom: '8px' }}>
          🌍 <strong>Scientists</strong> have officially discovered an extraordinary geographical location right in front of our eyes.
        </p>
        <p style={{ marginBottom: '8px' }}>
          🛰️ <strong>NASA</strong> has declared a space emergency to defend her forehead space station from meteors and flying slippers!
        </p>
        <p style={{ marginBottom: '8px' }}>
          🛵 <strong>Swiggy & Zomato</strong> are attempting the world's most epic birthday cake delivery rush across the Forehead Highway.
        </p>
        <p style={{ marginBottom: '8px' }}>
          🗺️ Even <strong>Google Maps</strong> has sent satellite vans to survey the endless perimeter!
        </p>
        <p style={{ color: '#ffd700', fontWeight: 600 }}>
          Only one person has the royal authority to govern this land.
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontFamily: 'var(--font-retro)', fontSize: '0.85rem', color: '#ff65a3', letterSpacing: '1px', marginBottom: '6px' }}>
          YOUR OFFICIAL MISSION:
        </p>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#fff', fontWeight: 800 }}>
          BECOME THE FOREHEAD QUEEN 👑
        </h3>
      </div>

      <button
        className="btn-arcade"
        onClick={handleAccept}
        style={{ padding: '14px 28px', fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', width: '100%', maxWidth: '340px' }}
      >
        <span>ACCEPT MISSION</span>
        <Check size={20} />
      </button>
    </div>
  );
}

