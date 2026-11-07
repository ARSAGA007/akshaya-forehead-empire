import React, { useState, useEffect, useRef } from 'react';
import { Rocket, RotateCcw, Award, ArrowRight, Clock, Shield, Star, Radio, Sparkles, CheckCircle2 } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';
import { fireCelebrationConfetti } from '../utils/confetti';

export default function SatelliteLandingGame({ onCompleteLevel, onUpdateScore }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('playing'); // playing, docking, landed, crashed, timeout
  const [timeLeft, setTimeLeft] = useState(50);
  const [fuel, setFuel] = useState(100);
  const [collectedStars, setCollectedStars] = useState(0);
  const [radioMsg, setRadioMsg] = useState('HOUSTON: Mission AKSHAYA-01 initiated. Collect beacons & land on forehead!');
  const [shields, setShields] = useState(3);

  // References for game loop
  const bgImageRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, up: false, down: false });
  const touchControlsRef = useRef({ left: false, right: false, up: false, down: false });

  // Satellite state
  const satRef = useRef({
    x: 242,
    y: 35,
    vx: 0,
    vy: 0.45,
    angle: 0,
    width: 36,
    height: 36,
    fuel: 100,
    shields: 3,
    invincibleTimer: 0,
    thrusting: false,
    autoDocking: false,
    particles: [],
    flagPlanted: false,
  });

  // 3 Collectible Birthday Beacons on the way down to her forehead
  const starsRef = useRef([
    { id: 1, x: 120, y: 130, collected: false, label: 'BEACON-A' },
    { id: 2, x: 380, y: 210, collected: false, label: 'BEACON-B' },
    { id: 3, x: 250, y: 290, collected: false, label: 'BEACON-C' },
  ]);

  // Gentle floating obstacles
  const obstaclesRef = useRef([
    { x: 30, y: 110, vx: 1.3, radius: 15, emoji: '☁️' },
    { x: 450, y: 175, vx: -1.4, radius: 14, emoji: '🕊️' },
    { x: 60, y: 245, vx: 1.5, radius: 15, emoji: '✨' },
  ]);

  // Landing Zone: Precision centered over Akshaya's Forehead & Pink Heart
  const landingZone = {
    x: 160,
    y: 370,
    width: 200,
    height: 48,
  };

  // Preload background image
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/akshaya-satellite-bg.jpg';
    img.onload = () => {
      bgImageRef.current = img;
    };
    img.onerror = () => {
      const fallback = new Image();
      fallback.src = '/assets/akshaya-closeup-2.jpg';
      fallback.onload = () => {
        bgImageRef.current = fallback;
      };
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keysRef.current.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keysRef.current.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
    };

    const handleKeyUp = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keysRef.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keysRef.current.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setGameState('timeout');
          audioSystem.playCollision();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  // Main game animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const gravity = 0.040;
    const thrustPower = 0.17;
    const lateralThrust = 0.17;
    const friction = 0.984;
    const lz = landingZone;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // 1. Draw Akshaya's Forehead Photograph
      if (bgImageRef.current) {
        ctx.drawImage(bgImageRef.current, 0, 0, W, H);

        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, 'rgba(15, 7, 35, 0.65)');
        grad.addColorStop(0.5, 'rgba(15, 7, 35, 0.35)');
        grad.addColorStop(1, 'rgba(15, 7, 35, 0.45)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.fillStyle = '#0f0723';
        ctx.fillRect(0, 0, W, H);
      }

      // Space stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let i = 0; i < 24; i++) {
        const sx = (i * 41 + (Date.now() / 45)) % W;
        const sy = (i * 31) % 250;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // 2. Airport Guidance Corridor
      ctx.save();
      const beamGrad = ctx.createLinearGradient(0, 160, 0, lz.y);
      beamGrad.addColorStop(0, 'rgba(255, 101, 163, 0)');
      beamGrad.addColorStop(1, 'rgba(255, 101, 163, 0.25)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(lz.x + 20, 160);
      ctx.lineTo(lz.x, lz.y);
      ctx.lineTo(lz.x + lz.width, lz.y);
      ctx.lineTo(lz.x + lz.width - 20, 160);
      ctx.closePath();
      ctx.fill();

      // Guidance lines
      ctx.strokeStyle = 'rgba(255, 101, 163, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(lz.x, lz.y);
      ctx.lineTo(lz.x + 20, 160);
      ctx.moveTo(lz.x + lz.width, lz.y);
      ctx.lineTo(lz.x + lz.width - 20, 160);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 3. Highlighted Forehead Runway
      ctx.save();
      ctx.fillStyle = 'rgba(236, 72, 153, 0.32)';
      ctx.fillRect(lz.x, lz.y, lz.width, lz.height);

      ctx.strokeStyle = '#ff2a85';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(lz.x, lz.y, lz.width, lz.height);
      ctx.setLineDash([]);

      // Runway beacon lights
      const lightCount = 8;
      const pulseColor = Math.sin(Date.now() / 150) > 0 ? '#4ade80' : '#22c55e';
      ctx.fillStyle = pulseColor;
      for (let i = 0; i < lightCount; i++) {
        const lx = lz.x + (lz.width / (lightCount - 1)) * i;
        ctx.beginPath();
        ctx.arc(lx, lz.y + lz.height - 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 4;
      ctx.fillText('AKSHAYA-01 FOREHEAD RUNWAY 💖', lz.x + lz.width / 2, lz.y - 10);
      ctx.shadowBlur = 0;
      ctx.restore();

      // 4. Draw Collectible Birthday Beacons (Floating Stars)
      starsRef.current.forEach((st) => {
        if (!st.collected) {
          ctx.save();
          const bounce = Math.sin((Date.now() / 200) + st.id) * 4;
          ctx.translate(st.x, st.y + bounce);

          // Glowing pulse ring
          ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⭐', 0, 0);

          ctx.font = '8px "Press Start 2P", monospace';
          ctx.fillStyle = '#ffd700';
          ctx.fillText(st.label, 0, 22);

          ctx.restore();
        }
      });

      // 5. Update & Draw Obstacles
      obstaclesRef.current.forEach((obs) => {
        obs.x += obs.vx;
        if (obs.vx > 0 && obs.x > W + 40) obs.x = -40;
        if (obs.vx < 0 && obs.x < -40) obs.x = W + 40;

        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obs.emoji, obs.x, obs.y);
      });

      // 6. Update Satellite Physics & Particle Trail
      const sat = satRef.current;
      if (sat.invincibleTimer > 0) {
        sat.invincibleTimer--;
      }

      // Draw exhaust particle trails
      sat.particles = sat.particles.filter((p) => p.life > 0);
      sat.particles.forEach((p) => {
        p.life -= 0.05;
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      });

      if (gameState === 'playing' || gameState === 'docking') {
        const up = keysRef.current.up || touchControlsRef.current.up;
        const down = keysRef.current.down || touchControlsRef.current.down;
        const left = keysRef.current.left || touchControlsRef.current.left;
        const right = keysRef.current.right || touchControlsRef.current.right;

        // Check star collection
        const satCenterX = sat.x + sat.width / 2;
        const satCenterY = sat.y + sat.height / 2;

        starsRef.current.forEach((st) => {
          if (!st.collected) {
            const dist = Math.hypot(satCenterX - st.x, satCenterY - st.y);
            if (dist < 28) {
              st.collected = true;
              audioSystem.playClick();
              audioSystem.playLevelComplete();
              onUpdateScore(50);
              const count = starsRef.current.filter((s) => s.collected).length;
              setCollectedStars(count);

              const radioMsgs = [
                'HOUSTON: Beacon-A locked! Forehead gravity is glorious! ⭐',
                'HOUSTON: Beacon-B online! Pink heart radar signal strong! ⭐⭐',
                'HOUSTON: Beacon-C secured! Cleared for Forehead Touchdown! ⭐⭐⭐',
              ];
              setRadioMsg(radioMsgs[count - 1] || 'HOUSTON: Beacon secured!');
            }
          }
        });

        // TRACTOR BEAM DOCKING ASSIST
        const targetPadX = lz.x + (lz.width - sat.width) / 2;
        const targetPadY = lz.y - sat.height + 4;
        const isNearRunway = sat.y >= lz.y - 65 && sat.x >= lz.x - 20 && sat.x <= lz.x + lz.width + 20;

        if (isNearRunway) {
          if (!sat.autoDocking) {
            sat.autoDocking = true;
            setGameState('docking');
            setRadioMsg('HOUSTON: Tractor beam locked! Final descent to Akshaya Base...');
            audioSystem.playLandingSuccess();
          }

          // Smooth magnetic pull
          sat.vx = (targetPadX - sat.x) * 0.12;
          sat.vy = Math.min(1.2, Math.max(0.4, (targetPadY - sat.y) * 0.15));
          sat.angle *= 0.7;

          sat.x += sat.vx;
          sat.y += sat.vy;

          if (Math.abs(sat.y - targetPadY) < 3) {
            sat.x = targetPadX;
            sat.y = targetPadY;
            sat.vx = 0;
            sat.vy = 0;
            sat.angle = 0;
            sat.flagPlanted = true;
            audioSystem.playLevelComplete();
            fireCelebrationConfetti();
            onUpdateScore(200);
            setGameState('landed');
            setRadioMsg('HOUSTON: TOUCHDOWN! Flag planted permanently on Akshaya-01! 🚩🎉');
          }
        } else {
          // Normal manual flying
          sat.thrusting = up;

          if (up && sat.fuel > 0) {
            sat.vy -= thrustPower;
            sat.fuel = Math.max(0, sat.fuel - 0.09);
            setFuel(Math.round(sat.fuel));
            if (Math.random() < 0.25) audioSystem.playThruster();

            // Emit thruster particles
            sat.particles.push({
              x: satCenterX + (Math.random() - 0.5) * 8,
              y: sat.y + sat.height + 4,
              vx: (Math.random() - 0.5) * 1.5,
              vy: 2 + Math.random() * 2,
              life: 1,
              size: 4 + Math.random() * 3,
              r: 56,
              g: 189,
              b: 248,
            });
          }
          if (down) sat.vy += thrustPower * 0.45;
          if (left) {
            sat.vx -= lateralThrust;
            sat.angle = -0.2;
          } else if (right) {
            sat.vx += lateralThrust;
            sat.angle = 0.2;
          } else {
            sat.angle *= 0.88;
          }

          // Physics
          sat.vy += gravity;
          sat.vx *= friction;
          sat.vy *= friction;

          sat.x += sat.vx;
          sat.y += sat.vy;

          // Boundaries
          if (sat.x < 15) { sat.x = 15; sat.vx = Math.abs(sat.vx) * 0.4; }
          if (sat.x > W - sat.width - 15) { sat.x = W - sat.width - 15; sat.vx = -Math.abs(sat.vx) * 0.4; }
          if (sat.y < 10) { sat.y = 10; sat.vy = 0; }

          // Obstacle collision
          if (sat.invincibleTimer <= 0) {
            for (let i = 0; i < obstaclesRef.current.length; i++) {
              const obs = obstaclesRef.current[i];
              const dist = Math.hypot(satCenterX - obs.x, satCenterY - obs.y);

              if (dist < obs.radius + 12) {
                audioSystem.playCollision();

                if (sat.shields > 1) {
                  sat.shields -= 1;
                  sat.invincibleTimer = 90;
                  sat.vy = -1.4;
                  setShields(sat.shields);
                  setRadioMsg('HOUSTON: Minor turbulence! Shield absorbed impact. ⚠️');
                } else {
                  sat.shields = 0;
                  setShields(0);
                  setGameState('crashed');
                }
                break;
              }
            }
          }

          // Off track check
          if (sat.y > lz.y + 40 && !sat.autoDocking) {
            audioSystem.playCollision();
            setGameState('crashed');
          }
        }
      }

      // 7. Draw Satellite
      ctx.save();
      ctx.translate(sat.x + sat.width / 2, sat.y + sat.height / 2);
      ctx.rotate(sat.angle);

      // Invincibility shield aura
      if (sat.invincibleTimer > 0) {
        ctx.strokeStyle = Math.sin(Date.now() / 50) > 0 ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, sat.width / 2 + 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Tractor beam glow during docking
      if (gameState === 'docking') {
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, sat.width / 2 + 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Satellite body
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-12, -12, 24, 24);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-12, -12, 24, 24);

      // Solar panels
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-28, -6, 14, 12);
      ctx.fillRect(14, -6, 14, 12);
      ctx.strokeStyle = '#93c5fd';
      ctx.strokeRect(-28, -6, 14, 12);
      ctx.strokeRect(14, -6, 14, 12);

      // Antenna
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(0, -22);
      ctx.stroke();
      ctx.fillStyle = '#ff2a85';
      ctx.beginPath();
      ctx.arc(0, -22, 3, 0, Math.PI * 2);
      ctx.fill();

      // Deployed Landing Gear
      if (gameState === 'landed' || gameState === 'docking') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 12); ctx.lineTo(-15, 20); ctx.lineTo(-20, 20);
        ctx.moveTo(10, 12); ctx.lineTo(15, 20); ctx.lineTo(20, 20);
        ctx.stroke();
      }

      ctx.restore();

      // 8. Planted Royal Flag on Forehead (Victory Visual)
      if (gameState === 'landed') {
        ctx.save();
        ctx.translate(sat.x + sat.width + 12, sat.y - 12);
        // Flag pole
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, -32);
        ctx.stroke();

        // Flag banner (Akshaya Queen Flag)
        ctx.fillStyle = '#ff2a85';
        ctx.beginPath();
        ctx.moveTo(0, -32); ctx.lineTo(24, -24); ctx.lineTo(0, -16);
        ctx.closePath();
        ctx.fill();

        ctx.font = '10px sans-serif';
        ctx.fillText('👑', 4, -22);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  const handleRestart = () => {
    satRef.current = {
      x: 242,
      y: 35,
      vx: 0,
      vy: 0.45,
      angle: 0,
      width: 36,
      height: 36,
      fuel: 100,
      shields: 3,
      invincibleTimer: 0,
      thrusting: false,
      autoDocking: false,
      particles: [],
      flagPlanted: false,
    };
    starsRef.current.forEach((s) => (s.collected = false));
    setCollectedStars(0);
    setTimeLeft(50);
    setFuel(100);
    setShields(3);
    setRadioMsg('HOUSTON: Telemetry re-established! Steer down into her forehead.');
    setGameState('playing');
  };

  return (
    <div className="arcade-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="retro-badge" style={{ background: 'rgba(168, 85, 247, 0.25)', borderColor: '#a855f7' }}>
            LEVEL 2: NASA SPACE EXPEDITION 🛰️
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', color: '#e9d5ff', marginTop: '4px' }}>
            Akshaya-01 Forehead Touchdown
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Beacons collected */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '5px 9px',
              borderRadius: '12px',
              fontFamily: 'var(--font-retro)',
              fontSize: '0.74rem',
              color: '#ffd700',
            }}
          >
            <Star size={13} color="#ffd700" />
            <span>BEACONS: {collectedStars}/3</span>
          </div>

          {/* Shields */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '5px 9px',
              borderRadius: '12px',
              fontFamily: 'var(--font-retro)',
              fontSize: '0.74rem',
              color: '#38bdf8',
            }}
          >
            <Shield size={13} color="#38bdf8" />
            <span>{'❤️'.repeat(shields)}</span>
          </div>

          {/* Fuel */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '5px 9px',
              borderRadius: '12px',
              fontFamily: 'var(--font-retro)',
              fontSize: '0.74rem',
              color: fuel < 25 ? '#f87171' : '#4ade80',
            }}
          >
            <span>FUEL: {fuel}%</span>
          </div>

          {/* Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: timeLeft < 10 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 0, 0, 0.4)',
              border: `1px solid ${timeLeft < 10 ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
              padding: '5px 9px',
              borderRadius: '12px',
              fontFamily: 'var(--font-retro)',
              fontSize: '0.74rem',
              color: timeLeft < 10 ? '#fca5a5' : '#ffd700',
            }}
          >
            <Clock size={13} />
            <span>{timeLeft}s</span>
          </div>

          <button
            onClick={() => {
              audioSystem.playClick();
              handleRestart();
            }}
            className="audio-ctrl-btn"
            title="Restart Level"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* NASA Houston Intercom Radio Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '12px',
          padding: '6px 14px',
          marginBottom: '10px',
          fontSize: '0.8rem',
          color: '#7dd3fc',
        }}
      >
        <Radio size={16} color="#38bdf8" style={{ animation: 'wiggle 2s infinite' }} />
        <span style={{ fontFamily: 'var(--font-retro)', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
          {radioMsg}
        </span>
      </div>

      {/* Game Canvas Viewport */}
      <div className="satellite-game-stage">
        <canvas ref={canvasRef} width={520} height={560} className="satellite-canvas" />

        {/* Live Status Badge */}
        {gameState === 'playing' && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(34, 197, 94, 0.9)',
              color: '#fff',
              padding: '5px 16px',
              borderRadius: '9999px',
              fontFamily: 'var(--font-retro)',
              fontSize: '0.65rem',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
            }}
          >
            🟢 COLLECT BEACONS & LAND ON PINK HEART
          </div>
        )}

        {gameState === 'docking' && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(56, 189, 248, 0.95)',
              color: '#fff',
              padding: '5px 18px',
              borderRadius: '9999px',
              fontFamily: 'var(--font-retro)',
              fontSize: '0.68rem',
              letterSpacing: '1px',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.6)',
              animation: 'wiggle 0.5s infinite',
            }}
          >
            ✨ FOREHEAD TRACTOR BEAM LOCKED! DOCKING...
          </div>
        )}

        {/* Touchdown Success Dialogue */}
        {gameState === 'landed' && (
          <div className="level-dialogue-overlay">
            <div style={{ fontSize: '3.2rem', marginBottom: '8px' }}>🚩🛰️💖</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#ffd700', marginBottom: '6px' }}>
              FLAG PLANTED ON AKSHAYA-01!
            </h3>
            <h4 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.8rem', color: '#4ade80', marginBottom: '16px' }}>
              NASA HAS OFFICIALLY BOOKED THIS LANDING STATION! 🛰️
            </h4>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.55)',
                padding: '14px 18px',
                borderRadius: '16px',
                textAlign: 'left',
                fontSize: '0.85rem',
                color: '#e2e8f0',
                lineHeight: '1.6',
                marginBottom: '18px',
                maxWidth: '380px',
              }}
            >
              <p>🛰️ <strong>Mission Report:</strong> Collected {collectedStars}/3 Space Beacons! Touched down right on the pink heart runway!</p>
              <p style={{ marginTop: '6px', color: '#7dd3fc' }}>📍 <strong>Official Catalog:</strong> Designated as Permanent Space Station AKSHAYA-01.</p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ffd700',
                fontFamily: 'var(--font-retro)',
                fontSize: '0.9rem',
                marginBottom: '20px',
              }}
            >
              <Award size={20} color="#ffd700" />
              <span>+{200 + collectedStars * 50} POINTS AWARDED</span>
            </div>

            <button
              className="btn-arcade"
              onClick={() => {
                audioSystem.playClick();
                onCompleteLevel();
              }}
            >
              <span>UNLOCK LEVEL 3: PARKING</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Crash or Timeout Dialogue */}
        {(gameState === 'crashed' || gameState === 'timeout') && (
          <div className="level-dialogue-overlay">
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>💥</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#f87171', marginBottom: '8px' }}>
              {gameState === 'crashed' ? 'MISSION ABORTED!' : 'TIME RAN OUT!'}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '20px', maxWidth: '340px' }}>
              {gameState === 'crashed'
                ? 'All shields depleted! Steer past the hazards and guide the craft into the runway.'
                : 'NASA telemetry timed out! Reach the runway before time expires.'}
            </p>
            <button className="btn-arcade" onClick={handleRestart}>
              <RotateCcw size={16} />
              <span>RELAUNCH SATELLITE</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch D-PAD & Controls */}
      <div style={{ marginTop: '14px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
          Desktop: <kbd>W</kbd>/<kbd>↑</kbd> Thrust Up | <kbd>A</kbd>/<kbd>D</kbd> or <kbd>←</kbd>/<kbd>→</kbd> Steer | Mobile: Touch D-Pad below
        </div>

        <div className="touch-dpad">
          <div></div>
          <button
            className="dpad-btn"
            onPointerDown={() => { touchControlsRef.current.up = true; }}
            onPointerUp={() => { touchControlsRef.current.up = false; }}
            onPointerLeave={() => { touchControlsRef.current.up = false; }}
          >
            ▲
          </button>
          <div></div>

          <button
            className="dpad-btn"
            onPointerDown={() => { touchControlsRef.current.left = true; }}
            onPointerUp={() => { touchControlsRef.current.left = false; }}
            onPointerLeave={() => { touchControlsRef.current.left = false; }}
          >
            ◀
          </button>
          <button
            className="dpad-btn"
            onPointerDown={() => { touchControlsRef.current.down = true; }}
            onPointerUp={() => { touchControlsRef.current.down = false; }}
            onPointerLeave={() => { touchControlsRef.current.down = false; }}
          >
            ▼
          </button>
          <button
            className="dpad-btn"
            onPointerDown={() => { touchControlsRef.current.right = true; }}
            onPointerUp={() => { touchControlsRef.current.right = false; }}
            onPointerLeave={() => { touchControlsRef.current.right = false; }}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
