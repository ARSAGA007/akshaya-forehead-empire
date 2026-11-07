import React, { useState, useEffect, useRef } from 'react';
import { Bike, RotateCcw, Award, ArrowRight, Clock, Shield, Star, Gift, Zap, Pause, Play, Heart, Volume2 } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';
import { fireCelebrationConfetti } from '../utils/confetti';

export default function BirthdayDeliveryDashGame({ onCompleteLevel, onUpdateScore, totalScore }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('playing'); // playing, paused, victory, gameover
  const [timeLeft, setTimeLeft] = useState(55);
  const [distance, setDistance] = useState(0); // 0 to 100%
  const [displayScore, setDisplayScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [notification, setNotification] = useState('SWIGGY DELIVERY HAS ENTERED THE FOREHEAD ZONE! 🛵');

  const bgImageRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, up: false, down: false, boost: false });
  const touchControlsRef = useRef({ left: false, right: false, boost: false });

  // Refs for loop state
  const gameStateRef = useRef('playing');
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(55);
  const spawnTimerRef = useRef(0);
  const roadOffsetRef = useRef(0);
  const lastDistanceReportedRef = useRef(0);

  // Scooter state
  const scooterRef = useRef({
    x: 235,
    y: 430,
    width: 42,
    height: 72,
    vx: 0,
    speed: 5.2,
    lives: 3,
    invincibleTimer: 0,
    sunscreenTimer: 0,
    boostTimer: 0,
    distanceTravelled: 0,
    totalDistance: 2800,
  });

  const obstaclesRef = useRef([]);
  const collectiblesRef = useRef([]);

  const funnyQuotes = [
    "SWIGGY DELIVERY HAS ENTERED THE FOREHEAD ZONE! 🛵",
    "GOOGLE MAPS CANNOT CALCULATE THIS ROUTE! 🗺️",
    "TRAFFIC JAM ON THE FOREHEAD HIGHWAY! 🚗",
    "DELIVERY PERSON NEEDS EXTRA FUEL! ⛽",
    "Cake delivery is harder than UPSC! 📚",
    "FASTTAG SCANNED ON AKSHAYA'S HIGHWAY! 🎟️",
    "DELIVERING IN 10 MINUTES OR FREE FOREHEAD ROAST! ⏱️",
  ];

  // Helper for cross-browser safe rounded rectangles
  const drawSafeRoundedRect = (c, x, y, width, height, radius) => {
    if (typeof c.roundRect === 'function') {
      c.roundRect(x, y, width, height, radius);
    } else {
      c.rect(x, y, width, height);
    }
  };

  const initGameObjects = () => {
    collectiblesRef.current = [
      { x: 180, y: 120, vy: 5.6, type: 'cake', emoji: '🎂', points: 100, radius: 18 },
      { x: 300, y: 40, vy: 5.6, type: 'gift', emoji: '🎁', points: 50, radius: 16 }
    ];
    obstaclesRef.current = [];
  };

  // Preload photo
  useEffect(() => {
    initGameObjects();
    const img = new Image();
    img.src = '/assets/akshaya-closeup-1.jpg';
    img.onload = () => {
      bgImageRef.current = img;
    };
  }, []);

  // Sync gameStateRef
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        keysRef.current.boost = true;
        activateBoost();
      }
      if (e.code === 'KeyP') {
        togglePause();
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) keysRef.current.boost = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const activateBoost = () => {
    const sc = scooterRef.current;
    if (sc.boostTimer <= 0) {
      sc.boostTimer = 140; // ~2.3 seconds boost
      audioSystem.playPowerUp ? audioSystem.playPowerUp() : audioSystem.playThruster();
    }
  };

  const togglePause = () => {
    audioSystem.playClick();
    setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
  };

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        timeLeftRef.current = next;

        if (next <= 0) {
          clearInterval(timer);
          setGameState('gameover');
          audioSystem.playCollision();
          return 0;
        }

        if (next % 7 === 0) {
          const randQuote = funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)];
          setNotification(randQuote);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const triggerVictory = () => {
    setGameState('victory');
    audioSystem.playCelebrationFanfare();
    fireCelebrationConfetti();
    onUpdateScore(300);
  };

  // Main Rock-Solid 60 FPS Game Animation Loop (Dependent ONLY on [gameState])
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      if (gameStateRef.current !== 'playing') return;
      animId = requestAnimationFrame(render);

      try {
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // 1. Draw Background Image
        if (bgImageRef.current) {
          ctx.drawImage(bgImageRef.current, 0, 0, W, H);
          ctx.fillStyle = 'rgba(12, 6, 26, 0.12)';
          ctx.fillRect(0, 0, W, H);
        } else {
          ctx.fillStyle = '#170c2a';
          ctx.fillRect(0, 0, W, H);
        }

        // 2. Scrolling Highway Road
        const roadLeft = 70;
        const roadWidth = 360;
        const roadRight = roadLeft + roadWidth;

        // Translucent Asphalt so Akshaya's forehead is clearly visible beneath the track
        ctx.fillStyle = 'rgba(28, 25, 45, 0.25)';
        ctx.fillRect(roadLeft, 0, roadWidth, H);

        // Neon road borders
        ctx.strokeStyle = '#ff2a85';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(roadLeft, 0); ctx.lineTo(roadLeft, H);
        ctx.moveTo(roadRight, 0); ctx.lineTo(roadRight, H);
        ctx.stroke();

        // Curb hazard stripes
        const curbStripeH = 24;
        for (let y = -curbStripeH; y < H + curbStripeH; y += curbStripeH * 2) {
          const drawY = (y + roadOffsetRef.current) % (H + curbStripeH);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(roadLeft - 8, drawY, 8, curbStripeH);
          ctx.fillRect(roadRight, drawY, 8, curbStripeH);
        }

        // Scrolling Lane dividing dashed lines
        const lane1 = roadLeft + roadWidth / 3;
        const lane2 = roadLeft + (roadWidth * 2) / 3;

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.setLineDash([20, 24]);
        ctx.lineDashOffset = -roadOffsetRef.current;

        ctx.beginPath();
        ctx.moveTo(lane1, 0); ctx.lineTo(lane1, H);
        ctx.moveTo(lane2, 0); ctx.lineTo(lane2, H);
        ctx.stroke();
        ctx.setLineDash([]);

        const sc = scooterRef.current;
        spawnTimerRef.current++;
        const currentSpawnTimer = spawnTimerRef.current;

        const boostActive = sc.boostTimer > 0;
        const currentRoadSpeed = boostActive ? 2.4 : 1.4; // Reduced to ~20% of previous speed (was 5.6 & 9.2)
        roadOffsetRef.current = (roadOffsetRef.current + currentRoadSpeed) % (H * 2);

        // Distance progression
        sc.distanceTravelled += currentRoadSpeed;
        const currentDistPercent = Math.min(100, Math.floor((sc.distanceTravelled / sc.totalDistance) * 100));

        // Discrete state update for UI distance (only updates if percentage changed!)
        if (currentDistPercent !== lastDistanceReportedRef.current) {
          lastDistanceReportedRef.current = currentDistPercent;
          setDistance(currentDistPercent);
        }

        if (currentDistPercent >= 100) {
          triggerVictory();
          return;
        }

        // Steer Left / Right
        const left = keysRef.current.left || touchControlsRef.current.left;
        const right = keysRef.current.right || touchControlsRef.current.right;

        sc.vx = 0;
        if (left) sc.vx -= sc.speed;
        if (right) sc.vx += sc.speed;

        sc.x += sc.vx;
        sc.x = Math.max(roadLeft + 6, Math.min(roadRight - sc.width - 6, sc.x));

        // Timers
        if (sc.invincibleTimer > 0) sc.invincibleTimer--;
        if (sc.sunscreenTimer > 0) sc.sunscreenTimer--;
        if (sc.boostTimer > 0) sc.boostTimer--;

        // A. Spawn Collectibles
        if (currentSpawnTimer % 48 === 0) {
          const colTypes = [
            { type: 'cake', emoji: '🎂', points: 100, radius: 18 },
            { type: 'gift', emoji: '🎁', points: 50, radius: 16 },
            { type: 'choc', emoji: '🍫', points: 25, radius: 15 },
            { type: 'star', emoji: '⭐', points: 75, radius: 16 },
            { type: 'sunscreen', emoji: '🧴', points: 50, radius: 18, isSunscreen: true },
          ];
          const choice = colTypes[Math.floor(Math.random() * colTypes.length)];
          const laneX = roadLeft + 25 + Math.random() * (roadWidth - 50);

          collectiblesRef.current.push({
            x: laneX,
            y: -30,
            vy: currentRoadSpeed,
            ...choice,
          });
        }

        // B. Spawn Obstacles
        if (currentSpawnTimer % 60 === 0) {
          const obsTypes = [
            { type: 'slipper', emoji: '🩴', radius: 18, speedBonus: 0.3 },
            { type: 'cone', emoji: '🚧', radius: 16, speedBonus: 0 },
            { type: 'pothole', emoji: '🕳️', radius: 18, speedBonus: 0 },
            { type: 'auto', emoji: '🛺', radius: 22, speedBonus: 0.4 },
          ];
          const choice = obsTypes[Math.floor(Math.random() * obsTypes.length)];
          const laneX = roadLeft + 25 + Math.random() * (roadWidth - 50);

          obstaclesRef.current.push({
            x: laneX,
            y: -35,
            vy: currentRoadSpeed + choice.speedBonus,
            ...choice,
          });
        }

        const scCenterX = sc.x + sc.width / 2;
        const scCenterY = sc.y + sc.height / 2;

        // C. Update Collectibles
        collectiblesRef.current.forEach((col) => {
          col.y += col.vy;
          const dist = Math.hypot(scCenterX - col.x, scCenterY - col.y);
          if (dist < col.radius + 18) {
            col.collected = true;
            audioSystem.playPickup ? audioSystem.playPickup() : audioSystem.playClick();
            onUpdateScore(col.points);
            scoreRef.current += col.points;
            setDisplayScore(scoreRef.current);

            if (col.isSunscreen) {
              sc.sunscreenTimer = 400;
              setNotification('SUNSCREEN BOOST ACTIVATED! 🧴 (IMMUNE TO HAZARDS)');
            }
          }
        });
        collectiblesRef.current = collectiblesRef.current.filter((c) => !c.collected && c.y < H + 40);

        // D. Update Obstacles
        obstaclesRef.current.forEach((obs) => {
          obs.y += obs.vy;

          if (sc.invincibleTimer <= 0 && sc.sunscreenTimer <= 0) {
            const dist = Math.hypot(scCenterX - obs.x, scCenterY - obs.y);
            if (dist < obs.radius + 16) {
              obs.collided = true;
              audioSystem.playCollision();

              sc.lives -= 1;
              sc.invincibleTimer = 80;
              setLives(sc.lives);

              if (sc.lives <= 0) {
                setGameState('gameover');
                audioSystem.playCollision();
              } else {
                setNotification('SCOOTER BUMPED! HOLD ON TO THE CAKE! ⚠️');
              }
            }
          }
        });
        obstaclesRef.current = obstaclesRef.current.filter((o) => !o.collided && o.y < H + 50);

        // 3. Draw Collectibles
        collectiblesRef.current.forEach((col) => {
          ctx.save();
          ctx.translate(col.x, col.y);
          ctx.font = `${col.radius * 1.6}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(col.emoji, 0, 0);
          ctx.restore();
        });

        // 4. Draw Obstacles
        obstaclesRef.current.forEach((obs) => {
          ctx.save();
          ctx.translate(obs.x, obs.y);
          ctx.font = `${obs.radius * 1.6}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(obs.emoji, 0, 0);
          ctx.restore();
        });

        // 5. Draw Animated Birthday Delivery Scooter
        ctx.save();
        ctx.translate(sc.x + sc.width / 2, sc.y + sc.height / 2);

        const isInvincible = sc.invincibleTimer > 0;
        if (!isInvincible || Math.floor(Date.now() / 80) % 2 === 0) {
          // Sunscreen Shield Aura
          if (sc.sunscreenTimer > 0) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(10, sc.height / 2 + 8), 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
            ctx.fill();
          }

          // Turbo Exhaust Flame
          if (sc.boostTimer > 0) {
            ctx.fillStyle = Math.random() > 0.5 ? '#f43f5e' : '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(-6, sc.height / 2);
            ctx.lineTo(6, sc.height / 2);
            ctx.lineTo(0, sc.height / 2 + 18 + Math.random() * 8);
            ctx.closePath();
            ctx.fill();
          }

          // Scooter Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.ellipse(2, 4, sc.width / 2, sc.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Scooter Body
          ctx.fillStyle = '#ff2a85';
          ctx.beginPath();
          drawSafeRoundedRect(ctx, -sc.width / 2 + 4, -sc.height / 2 + 10, sc.width - 8, sc.height - 20, 8);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Front Wheel & Handlebars
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-sc.width / 2 + 10, -sc.height / 2, sc.width - 20, 10);
          ctx.fillStyle = '#ffd700';
          ctx.fillRect(-sc.width / 2 + 4, -sc.height / 2 - 4, sc.width - 8, 5);

          // Headlight Beam
          ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
          ctx.beginPath();
          ctx.moveTo(-8, -sc.height / 2 - 4);
          ctx.lineTo(-24, -sc.height / 2 - 50);
          ctx.lineTo(24, -sc.height / 2 - 50);
          ctx.lineTo(8, -sc.height / 2 - 4);
          ctx.closePath();
          ctx.fill();

          // Delivery Box on Back with Birthday Cake!
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          drawSafeRoundedRect(ctx, -sc.width / 2 + 2, sc.height / 2 - 32, sc.width - 4, 26, 6);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🎂', 0, sc.height / 2 - 14);

          // Driver Helmet
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, -6, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.restore();
      } catch (err) {
        console.error("BirthdayDeliveryDash render error:", err);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]); // Only depends on gameState!

  const isDraggingRef = useRef(false);

  const steerScooterToCoords = (clientX) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const targetX = (clientX - rect.left) * scaleX;
    const sc = scooterRef.current;
    const roadLeft = 70;
    const roadWidth = 360;
    const roadRight = roadLeft + roadWidth;
    sc.x = Math.max(roadLeft + 6, Math.min(roadRight - sc.width - 6, targetX - sc.width / 2));
  };

  const handleCanvasTouchMove = (e) => {
    if (e.cancelable) e.preventDefault();
    if (e.touches && e.touches[0]) {
      steerScooterToCoords(e.touches[0].clientX);
    }
  };

  const handleCanvasMouseDown = (e) => {
    isDraggingRef.current = true;
    steerScooterToCoords(e.clientX);
  };

  const handleCanvasMouseMove = (e) => {
    if (isDraggingRef.current) {
      steerScooterToCoords(e.clientX);
    }
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleRestart = () => {
    initGameObjects();
    scooterRef.current = {
      x: 235,
      y: 430,
      width: 42,
      height: 72,
      vx: 0,
      speed: 5.2,
      lives: 3,
      invincibleTimer: 0,
      sunscreenTimer: 0,
      boostTimer: 0,
      distanceTravelled: 0,
      totalDistance: 2800,
    };
    spawnTimerRef.current = 0;
    scoreRef.current = 0;
    timeLeftRef.current = 55;
    lastDistanceReportedRef.current = 0;
    setTimeLeft(55);
    setDistance(0);
    setDisplayScore(0);
    setLives(3);
    setNotification('SWIGGY DELIVERY HAS ENTERED THE FOREHEAD ZONE! 🛵');
    setGameState('playing');
  };

  const handleHonk = () => {
    audioSystem.playScooterHorn ? audioSystem.playScooterHorn() : audioSystem.playCarHonk();
  };

  return (
    <div className="arcade-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="retro-badge" style={{ background: 'rgba(56, 189, 248, 0.25)', borderColor: '#38bdf8', color: '#bae6fd' }}>
            LEVEL 3: FOREHEAD DELIVERY DASH 🛵
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', color: '#ffd700', marginTop: '4px' }}>
            Akshaya's Cake Delivery Rush
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Lives */}
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
              color: '#f43f5e',
            }}
          >
            <span>{lives > 0 ? '🛵'.repeat(lives) : '💀 CRASHED'}</span>
          </div>

          {/* Delivery Points */}
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
            <span>+{displayScore} PTS</span>
          </div>

          {/* Countdown Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: timeLeft < 15 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 0, 0, 0.4)',
              border: `1px solid ${timeLeft < 15 ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
              padding: '5px 9px',
              borderRadius: '12px',
              fontFamily: 'var(--font-retro)',
              fontSize: '0.74rem',
              color: timeLeft < 15 ? '#fca5a5' : '#4ade80',
            }}
          >
            <Clock size={13} />
            <span>{timeLeft}s</span>
          </div>

          {/* Pause */}
          <button
            onClick={togglePause}
            className="audio-ctrl-btn"
            title={gameState === 'paused' ? 'Resume Delivery' : 'Pause'}
          >
            {gameState === 'paused' ? <Play size={15} color="#4ade80" /> : <Pause size={15} />}
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              audioSystem.playClick();
              handleRestart();
            }}
            className="audio-ctrl-btn"
            title="Restart Delivery"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Delivery Progress Bar */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#e2e8f0', marginBottom: '4px', fontFamily: 'var(--font-retro)' }}>
          <span>🛵 KILOMETERS TO PARTY:</span>
          <span style={{ color: '#ffd700' }}>{distance}% COMPLETED</span>
        </div>
        <div
          style={{
            width: '100%',
            height: '10px',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '9999px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 101, 163, 0.4)',
          }}
        >
          <div
            style={{
              width: `${distance}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #38bdf8, #ec4899, #ffd700)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
      </div>

      {/* Dynamic Road Announcement Ticker */}
      <div
        style={{
          background: 'rgba(22, 10, 42, 0.92)',
          border: '1px solid rgba(56, 189, 248, 0.45)',
          borderRadius: '12px',
          padding: '6px 14px',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: '#fef08a',
          gap: '8px',
        }}
      >
        <span style={{ fontFamily: 'var(--font-retro)', fontSize: '0.64rem', letterSpacing: '0.5px' }}>
          📢 {notification}
        </span>
        <button
          onClick={handleHonk}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '9999px',
            padding: '2px 9px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-heading)',
            whiteSpace: 'nowrap',
          }}
          title="Honk Scooter Horn"
        >
          🔊 HONK!
        </button>
      </div>

      {/* Road Canvas Viewport */}
      <div className="parking-game-stage">
        <canvas
          ref={canvasRef}
          width={500}
          height={550}
          className="parking-canvas"
          onTouchStart={handleCanvasTouchMove}
          onTouchMove={handleCanvasTouchMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          style={{ cursor: 'grab', touchAction: 'none' }}
        />

        {/* Pause Overlay */}
        {gameState === 'paused' && (
          <div className="level-dialogue-overlay">
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>⏸️</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#ffd700', marginBottom: '6px' }}>
              DELIVERY PAUSED
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '20px' }}>
              The birthday cake is resting safely on the moped rack!
            </p>
            <button className="btn-arcade" onClick={togglePause}>
              <Play size={18} />
              <span>RESUME DASH</span>
            </button>
          </div>
        )}

        {/* Victory Celebration Dialogue */}
        {gameState === 'victory' && (
          <div className="level-dialogue-overlay">
            <div style={{ fontSize: '3.4rem', marginBottom: '8px' }}>🎂🛵🎉</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.7rem', color: '#ffd700', marginBottom: '6px' }}>
              DELIVERY SUCCESSFUL! 🎂
            </h3>
            <h4 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.82rem', color: '#4ade80', marginBottom: '16px' }}>
              THE WORLD'S BIGGEST BIRTHDAY DELIVERY COMPLETED!
            </h4>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
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
              <p>🛵 <strong>Delivery Report:</strong> You navigated potholes, flying slippers, and Chennai traffic across Akshaya's forehead highway! The royal birthday cake arrived in mint condition!</p>
              <p style={{ marginTop: '6px', color: '#ffd700' }}>⭐ Level 3 Bonus: <strong>+300 POINTS</strong></p>
              <p style={{ marginTop: '4px', color: '#86efac', fontWeight: 700 }}>
                🎯 Total Accumulated Score: {totalScore + 300 + displayScore} PTS!
              </p>
            </div>

            <button
              className="btn-arcade"
              onClick={() => {
                audioSystem.playClick();
                onCompleteLevel();
              }}
            >
              <span>PROCEED TO VICTORY... WAIT? 👀</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Game Over Dialogue */}
        {gameState === 'gameover' && (
          <div className="level-dialogue-overlay">
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>💥🛵</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#f87171', marginBottom: '8px' }}>
              CAKE DELIVERY FAILED!
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '20px', maxWidth: '340px' }}>
              The potholes and flying slippers claimed the scooter! Grab the 🧴 Sunscreen Boost for temporary shield immunity.
            </p>
            <button className="btn-arcade" onClick={handleRestart}>
              <RotateCcw size={16} />
              <span>RESTART DELIVERY DASH</span>
            </button>
          </div>
        )}
      </div>

      {/* Desktop and Mobile Controls */}
      <div style={{ marginTop: '12px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
          Desktop: <kbd>A</kbd>/<kbd>D</kbd> or <kbd>←</kbd>/<kbd>→</kbd> Steer | <kbd>Space</kbd>/<kbd>W</kbd> Boost | Mobile: Buttons below
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', alignItems: 'center' }}>
          <button
            className="dpad-btn"
            style={{ width: '70px', height: '52px', fontSize: '1.3rem' }}
            onPointerDown={() => { touchControlsRef.current.left = true; }}
            onPointerUp={() => { touchControlsRef.current.left = false; }}
            onPointerLeave={() => { touchControlsRef.current.left = false; }}
          >
            ◀ LEFT
          </button>

          <button
            className="btn-arcade btn-gold"
            style={{ padding: '10px 22px', fontSize: '0.9rem' }}
            onClick={activateBoost}
          >
            <Zap size={18} />
            <span>BOOST 🚀</span>
          </button>

          <button
            className="dpad-btn"
            style={{ width: '70px', height: '52px', fontSize: '1.3rem' }}
            onPointerDown={() => { touchControlsRef.current.right = true; }}
            onPointerUp={() => { touchControlsRef.current.right = false; }}
            onPointerLeave={() => { touchControlsRef.current.right = false; }}
          >
            RIGHT ▶
          </button>
        </div>
      </div>
    </div>
  );
}
