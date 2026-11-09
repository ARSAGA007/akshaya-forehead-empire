import React, { useEffect, useState } from 'react';
import { RotateCcw, Video, Volume2, VolumeX, Sparkles, Heart, Trophy, PartyPopper, Cake } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';
import { fireCelebrationConfetti, fireContinuousFireworks, fireHeartConfetti } from '../utils/confetti';

export default function FinalCelebration({
  totalScore,
  onPlayAgain,
  onWatchVideoAgain,
  isMuted,
  onToggleMute,
}) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const gallery = [
    { src: '/assets/akshaya-main.jpg', caption: 'The Forehead Queen 👑' },
    { src: '/assets/akshaya-closeup-1.jpg', caption: 'The Endless Territory 📐' },
    { src: '/assets/akshaya-closeup-2.jpg', caption: 'Space Station AK-01 🚀' },
    { src: '/assets/akshaya-photo-2.jpg', caption: 'Forehead Highway 🛵' },
    { src: '/assets/akshaya-photo-3.jpg?v=2', caption: 'Secret Boss Reaction 😂' },
  ];

  useEffect(() => {
    // Launch fireworks fanfare
    audioSystem.startMusic();
    audioSystem.playCelebrationFanfare();
    fireCelebrationConfetti();
    fireContinuousFireworks(4);

    // Auto rotate photo showcase every 4 seconds
    const interval = setInterval(() => {
      setActivePhotoIdx((prev) => (prev + 1) % gallery.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const triggerMoreFireworks = () => {
    audioSystem.playClick();
    fireCelebrationConfetti();
    fireHeartConfetti();
  };

  return (
    <div className="arcade-card animate-pulse-glow" style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
      {/* Floating Birthday Balloons & Hearts */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '2.4rem', marginBottom: '8px' }}>
        <span style={{ animation: 'bounceSlow 2.5s infinite' }}>🎈</span>
        <span style={{ animation: 'bounceSlow 2s infinite 0.3s' }}>✨</span>
        <span style={{ animation: 'bounceSlow 2.2s infinite 0.6s' }}>🎂</span>
        <span style={{ animation: 'bounceSlow 2.6s infinite 0.9s' }}>🎉</span>
        <span style={{ animation: 'bounceSlow 2.4s infinite 1.2s' }}>🎈</span>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-retro)',
          fontSize: '0.85rem',
          color: '#ffd700',
          letterSpacing: '2px',
          marginBottom: '6px',
        }}
      >
        🏆 THE ONE AND ONLY 🏆
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #ffd700 0%, #ff65a3 50%, #f43f5e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1,
          marginBottom: '8px',
          textShadow: '0 4px 20px rgba(255, 42, 133, 0.4)',
        }}
      >
        FOREHEAD QUEEN 👑
      </h1>

      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)',
          color: '#ffffff',
          fontWeight: 800,
          marginBottom: '20px',
        }}
      >
        HAPPY BIRTHDAY AKSHAYA! 🎂🎉
      </h2>

      {/* Hero Royal Photograph Showcase */}
      <div style={{ position: 'relative', width: 'clamp(180px, 45vw, 230px)', height: 'clamp(220px, 55vw, 280px)', margin: '0 auto 20px auto' }}>
        <div className="portrait-glow-ring"></div>
        <div className="crown-badge" style={{ fontSize: 'clamp(2.4rem, 6vw, 3rem)', top: '-28px' }}>👑</div>
        <img
          src={gallery[activePhotoIdx].src}
          alt={gallery[activePhotoIdx].caption}
          className="portrait-hero-img"
          style={{ transition: 'all 0.5s ease' }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-14px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(21, 13, 42, 0.94)',
            border: '2px solid #ffd700',
            color: '#ffd700',
            fontFamily: 'var(--font-retro)',
            fontSize: 'clamp(0.5rem, 2.2vw, 0.58rem)',
            padding: '4px 10px',
            borderRadius: '9999px',
            whiteSpace: 'nowrap',
            maxWidth: '92vw',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            boxSizing: 'border-box',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
            zIndex: 10,
          }}
        >
          {gallery[activePhotoIdx].caption}
        </div>
      </div>

      {/* Mini Photo Switcher Thumbnails */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '22px' }}>
        {gallery.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              audioSystem.playClick();
              setActivePhotoIdx(idx);
            }}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: activePhotoIdx === idx ? '2px solid #ffd700' : '2px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              padding: 0,
              opacity: activePhotoIdx === idx ? 1 : 0.6,
              transform: activePhotoIdx === idx ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.2s',
            }}
          >
            <img src={item.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        ))}
      </div>

      {/* Heartfelt Birthday Message */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 192, 240, 0.25)',
          borderRadius: '24px',
          padding: '22px 24px',
          maxWidth: '620px',
          margin: '0 auto 24px auto',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            color: '#ffc6dc',
            fontWeight: 700,
            marginBottom: '10px',
            lineHeight: 1.4,
          }}
        >
          "Three missions completed. One legendary forehead. Unlimited memories!" 💖
        </p>
        <p
          style={{
            fontSize: '1.05rem',
            color: '#f3e8ff',
            lineHeight: 1.6,
          }}
        >
          May your birthday be filled with infinite happiness, unstoppable laughter, endless love, and unforgettable moments with all of us! 🌸✨
        </p>

        {/* Final Score Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid #ffd700',
            padding: '8px 20px',
            borderRadius: '9999px',
            color: '#ffd700',
            fontFamily: 'var(--font-retro)',
            fontSize: '0.82rem',
          }}
        >
          <Trophy size={16} color="#ffd700" />
          <span>PERFECT SCORE: {totalScore} / 600 PTS</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '14px',
          flexWrap: 'wrap',
          marginBottom: '14px',
        }}
      >
        <button className="btn-arcade" onClick={onPlayAgain}>
          <RotateCcw size={18} />
          <span>PLAY AGAIN 🔄</span>
        </button>

        <button className="btn-arcade btn-secondary" onClick={onWatchVideoAgain}>
          <Video size={18} />
          <span>WATCH SECRET VIDEO AGAIN 🎬</span>
        </button>

        <button className="btn-arcade btn-gold" onClick={triggerMoreFireworks}>
          <PartyPopper size={18} />
          <span>BURST FIREWORKS 🎆</span>
        </button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <button
          className="audio-ctrl-btn"
          style={{ margin: '0 auto', width: 'auto', padding: '6px 18px', borderRadius: '9999px' }}
          onClick={() => {
            audioSystem.playClick();
            onToggleMute();
          }}
        >
          {isMuted ? <VolumeX size={16} color="#f87171" /> : <Volume2 size={16} color="#4ade80" />}
          <span style={{ marginLeft: '8px', fontSize: '0.8rem' }}>
            {isMuted ? 'MUSIC: MUTED (CLICK TO UNMUTE)' : 'MUSIC: PLAYING 🎵'}
          </span>
        </button>
      </div>
    </div>
  );
}

