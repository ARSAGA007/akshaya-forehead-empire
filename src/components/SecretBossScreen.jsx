import React, { useState } from 'react';
import { Lock, Unlock, Sparkles, ArrowRight, Video, Flame } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';
import BirthdayVideoPlayer from './BirthdayVideoPlayer';
import { fireCelebrationConfetti } from '../utils/confetti';

export default function SecretBossScreen({ onProceedToFinalCelebration }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);

  const handleUnlock = () => {
    audioSystem.playClick();
    audioSystem.playLaser();
    setIsUnlocked(true);
  };

  const handleVideoEnd = () => {
    setVideoFinished(true);
    audioSystem.playCelebrationFanfare();
    fireCelebrationConfetti();
  };

  return (
    <div className="arcade-card" style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
      {!isUnlocked ? (
        <div style={{ padding: '20px 10px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(90deg, #7c3aed, #db2777)',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontFamily: 'var(--font-retro)',
              fontSize: '0.8rem',
              color: '#fff',
              marginBottom: '20px',
            }}
          >
            <span>⚠️ FINAL BOSS ENCOUNTER</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              color: '#ffd700',
              fontWeight: 800,
              marginBottom: '10px',
            }}
          >
            WAIT... SOMETHING IS NOT RIGHT. 👀
          </h2>

          <p
            style={{
              fontSize: '1.15rem',
              color: '#e9d5ff',
              fontWeight: 600,
              marginBottom: '24px',
            }}
          >
            The final boss has arrived! You conquered the forehead measurement, the space station rescue, and the Swiggy delivery rush... but can you handle the ultimate truth?
          </p>

          {/* Mysterious Boss Preview with Meme photo */}
          <div
            style={{
              position: 'relative',
              width: '260px',
              margin: '0 auto 28px auto',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '3px solid #ff2a85',
              boxShadow: '0 0 35px rgba(255, 42, 133, 0.5)',
            }}
          >
            <img
              src="/assets/akshaya-photo-3.jpg?v=2"
              alt="Secret Final Boss Akshaya"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(21, 13, 42, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.75)',
                  padding: '12px',
                  borderRadius: '50%',
                  border: '2px solid #ffd700',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
                }}
              >
                <Lock size={36} color="#ffd700" />
              </div>
            </div>
          </div>

          <button className="btn-arcade btn-gold" onClick={handleUnlock} style={{ padding: '16px 36px', fontSize: '1.15rem' }}>
            <Unlock size={22} />
            <span>UNLOCK THE SECRET SURPRISE 🔓</span>
          </button>
        </div>
      ) : (
        <div>
          {/* Secret Moment Reveal */}
          <div style={{ marginBottom: '18px' }}>
            <span className="retro-badge" style={{ background: 'rgba(255, 101, 163, 0.25)', borderColor: '#ff65a3' }}>
              SECRET STAGE 4 UNLOCKED
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                color: '#ffd700',
                marginTop: '6px',
                fontWeight: 800,
              }}
            >
              YOU HAVE UNLOCKED AKSHAYA'S SECRET MOMENT! 🎬
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#d8b4fe' }}>
              Original Uncut Archival Footage from the Forehead Chronicles
            </p>
          </div>

          {/* Responsive Video Player */}
          <BirthdayVideoPlayer onVideoEnd={handleVideoEnd} />

          {/* After video ends or player wants to proceed */}
          <div
            style={{
              marginTop: '24px',
              padding: '18px',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 101, 163, 0.3)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', color: '#ff65a3', marginBottom: '6px' }}>
              "YOU SURVIVED ALL THREE MISSIONS!"
            </h3>
            <p style={{ fontSize: '1.1rem', color: '#ffd700', fontWeight: 700, marginBottom: '18px' }}>
              "BUT YOU CAN NEVER ESCAPE AKSHAYA! 😂"
            </p>

            <button
              className="btn-arcade"
              onClick={() => {
                audioSystem.playClick();
                audioSystem.playCelebrationFanfare();
                onProceedToFinalCelebration();
              }}
              style={{ padding: '14px 30px' }}
            >
              <span>CLAIM ROYAL BIRTHDAY CROWN 👑</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

