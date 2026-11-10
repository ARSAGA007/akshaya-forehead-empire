import React, { useState } from 'react';
import { Sparkles, Compass, Rocket, Bike, Heart, PartyPopper, X } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';
import { fireHeartConfetti } from '../utils/confetti';

export default function WelcomeScreen({ onStartChallenge }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleOpenConfirm = () => {
    audioSystem.playClick();
    setHasConfirmed(false);
    setShowConfirmModal(true);
  };

  const handleCancel = () => {
    audioSystem.playClick();
    setShowConfirmModal(false);
    setHasConfirmed(false);
  };

  const handleAcceptAndStart = () => {
    if (!hasConfirmed) return;
    audioSystem.playClick();
    audioSystem.startMusic();
    fireHeartConfetti();
    setShowConfirmModal(false);
    onStartChallenge();
  };

  return (
    <div className="arcade-card animate-pulse-glow" style={{ textAlign: 'center', margin: '0 auto', width: '100%' }}>
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

      <div style={{ marginTop: '24px' }}>
        <button
          className="btn-arcade"
          onClick={handleOpenConfirm}
          style={{ padding: '14px 28px', fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)', width: '100%', maxWidth: '360px' }}
        >
          <span>START THE CHALLENGE</span>
          <span style={{ fontSize: '1.3rem' }}>🚀</span>
        </button>
      </div>

      <div style={{ marginTop: '16px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
        🔊 Tap start to enable arcade music & audio effects!
      </div>

      {/* Confirmation Pop-Up Modal */}
      {showConfirmModal && (
        <div
          className="confirm-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancel();
          }}
        >
          <div className="confirm-modal-box" role="dialog" aria-modal="true">
            {/* Close X button */}
            <button
              onClick={handleCancel}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Icon & Badge */}
            <div style={{ fontSize: '2.4rem', marginBottom: '6px' }}>
              📜
            </div>

            <div style={{ marginBottom: '10px' }}>
              <span
                className="retro-badge"
                style={{
                  background: 'rgba(255, 42, 133, 0.25)',
                  borderColor: '#ff65a3',
                  color: '#ffc6dc',
                  fontSize: '0.72rem',
                }}
              >
                CHALLENGE BRIEFING
              </span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.3rem, 3.8vw, 1.6rem)',
                fontWeight: 800,
                color: '#ffd700',
                marginBottom: '14px',
                textShadow: '0 2px 12px rgba(255, 215, 0, 0.35)',
              }}
            >
              Before You Begin! 👑
            </h2>

            {/* Instruction Message */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1.5px solid rgba(255, 192, 240, 0.25)',
                borderRadius: '16px',
                padding: '16px 14px',
                marginBottom: '18px',
                lineHeight: 1.55,
                boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.05)',
              }}
            >
              <p
                style={{
                  fontSize: 'clamp(0.92rem, 2.5vw, 1rem)',
                  color: '#f3e8ff',
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                Before you begin, please make sure to read each and every line carefully. Pay close attention to all the instructions to ensure you fully understand the challenge and its rules.
              </p>
            </div>

            {/* Checkbox with Label */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: hasConfirmed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: `2px solid ${hasConfirmed ? '#22c55e' : 'rgba(255, 101, 163, 0.35)'}`,
                padding: '12px 14px',
                borderRadius: '14px',
                cursor: 'pointer',
                marginBottom: '22px',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                boxShadow: hasConfirmed ? '0 0 15px rgba(34, 197, 94, 0.25)' : 'none',
              }}
            >
              <input
                type="checkbox"
                checked={hasConfirmed}
                onChange={(e) => {
                  audioSystem.playClick();
                  setHasConfirmed(e.target.checked);
                }}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#ff2a85',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(0.85rem, 2.4vw, 0.92rem)',
                  fontWeight: 600,
                  color: hasConfirmed ? '#86efac' : '#e9d5ff',
                  lineHeight: 1.35,
                  userSelect: 'none',
                }}
              >
                I have read and understood all the instructions.
              </span>
            </label>

            {/* Modal Actions */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="btn-arcade btn-secondary"
                onClick={handleCancel}
                style={{
                  flex: '1 1 120px',
                  padding: '12px 18px',
                  fontSize: '0.95rem',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-arcade"
                disabled={!hasConfirmed}
                onClick={handleAcceptAndStart}
                style={{
                  flex: '1 1 150px',
                  padding: '12px 18px',
                  fontSize: '0.95rem',
                  opacity: hasConfirmed ? 1 : 0.45,
                  cursor: hasConfirmed ? 'pointer' : 'not-allowed',
                  filter: hasConfirmed ? 'none' : 'grayscale(50%)',
                  boxShadow: hasConfirmed ? undefined : 'none',
                  transform: hasConfirmed ? undefined : 'none',
                }}
              >
                <span>Accept & Start</span>
                <Rocket size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

