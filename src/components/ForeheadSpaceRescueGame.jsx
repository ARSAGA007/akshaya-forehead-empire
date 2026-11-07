import React, { useState, useEffect, useRef } from 'react';
import { Rocket, RotateCcw, Award, ArrowRight, Clock, Shield, Star, Gift, Zap, Magnet, Heart, Pause, Play } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';
import { fireCelebrationConfetti } from '../utils/confetti';

export default function ForeheadSpaceRescueGame({ onCompleteLevel, onUpdateScore }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('playing'); // playing, paused, victory, gameover
  const [timeLeft, setTimeLeft] = useState(30);
  const [displayScore, setDisplayScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [activePowerUpName, setActivePowerUpName] = useState(null);
  const [notification, setNotification] = useState('NASA HAS DECLARED AN EMERGENCY! 🚨 PROTECT THE FOREHEAD!');

  const bgImageRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, up: false, down: false });
  const touchControlsRef = useRef({ left: false, right: false, up: false, down: false });

  // Refs for loop state (Never causes re-render)
  const spawnTimerRef = useRef(0);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(30);
  const gameStateRef = useRef('playing');

  // Spaceship physics state
  const shipRef = useRef({
    x: 236,
    y: 420,
    vx: 0,
    vy: 0,
    speed: 5.0,
    width: 44,
    height: 44,
    angle: 0,
    lives: 3,
    invincibleTimer: 0,
    shieldTimer: 0,
    magnetTimer: 0,
    turboTimer: 0,
    particles: [],
  });

  const obstaclesRef = useRef([]);
  const collectiblesRef = useRef([]);
  const powerUpsRef = useRef([]);

  const funnyQuotes = [
    "NASA HAS DECLARED AN EMERGENCY! 🚨",
    "WARNING: FOREHEAD SPACE DEBRIS DETECTED! 🛰️",
    "EVEN ALIENS ARE JEALOUS! 👽",
    "SUNSCREEN PROTECTION ACTIVATED! 🧴",
    "WATCH OUT! FLYING SLIPPER APPROACHING! 🩴",
    "DEEP SPACE SCIENTISTS ARE AMAZED! 🔭",
    "AKSHAYA'S FOREHEAD SHINES ACROSS THE GALAXY! ✨",
  ];

  // Initial seed of collectibles so the stage is lively right away
  const initGameObjects = () => {
    obstaclesRef.current = [
      { x: 160, y: -20, vx: 0.3, vy: 2.2, radius: 18, emoji: '☄️', angle: 0, rotSpeed: 0.03 }
    ];
    collectiblesRef.current = [
      { x: 120, y: 140, vx: 0.2, vy: 1.8, type: 'star', points: 25, radius: 15, emoji: '⭐' },
      { x: 380, y: 90, vx: -0.2, vy: 1.9, type: 'gift', points: 50, radius: 18, emoji: '🎁' },
      { x: 260, y: 30, vx: 0.1, vy: 1.7, type: 'star', points: 25, radius: 15, emoji: '⭐' }
    ];
    powerUpsRef.current = [
      { x: 320, y: -40, vy: 1.6, type: 'shield', emoji: '🧴', radius: 20 }
    ];
  };

  // Preload photo
  useEffect(() => {
    initGameObjects();
    const img = new Image();
    img.src = '/assets/akshaya-satellite-bg.jpg?v=2';
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

  // Sync gameStateRef
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keysRef.current.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keysRef.current.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
      if (e.code === 'KeyP') {
        togglePause();
      }
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

  // 60-Second Countdown Timer (Discrete 1-second interval)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        timeLeftRef.current = next;

        if (next <= 0) {
          clearInterval(timer);
          triggerVictory();
          return 0;
        }

        // Periodic funny notifications
        if (next % 8 === 0) {
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
    onUpdateScore(200);
  };

  const togglePause = () => {
    audioSystem.playClick();
    setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
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

        // 1. Draw Background Image (Akshaya's photograph)
        if (bgImageRef.current) {
          ctx.drawImage(bgImageRef.current, 0, 0, W, H);
          const grad = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, 360);
          grad.addColorStop(0, 'rgba(15, 7, 35, 0.12)');
          grad.addColorStop(1, 'rgba(15, 7, 35, 0.55)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        } else {
          ctx.fillStyle = '#0f0723';
          ctx.fillRect(0, 0, W, H);
        }

        // Forehead Space Station Radar Zone (Centered directly on her forehead at y: 280)
        ctx.save();
        const radarPulse = Math.sin(Date.now() / 400) * 6;
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(W / 2, 280, Math.max(10, 80 + radarPulse), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(255, 198, 220, 0.9)';
        ctx.font = '10px "Press Start 2P", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ FOREHEAD STATION SECTOR ⚡', W / 2, 385);
        ctx.restore();

        // Animated cosmic stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 30; i++) {
          const sx = (i * 37 + (Date.now() / 40)) % W;
          const sy = (i * 47) % H;
          ctx.fillRect(sx, sy, 2, 2);
        }

        const ship = shipRef.current;
        spawnTimerRef.current++;
        const currentSpawnTimer = spawnTimerRef.current;

        // Difficulty progression based on timeLeftRef
        const progress = Math.max(0, Math.min(1, (30 - timeLeftRef.current) / 30));
        const spawnRate = Math.max(22, Math.floor(45 - progress * 20));

        // A. Spawn Obstacles
        if (currentSpawnTimer % spawnRate === 0) {
          const types = [
            { emoji: '☄️', radius: 18, speed: 2.3 + progress * 1.8 },
            { emoji: '🩴', radius: 18, speed: 2.6 + progress * 2.0 },
            { emoji: '🕊️', radius: 16, speed: 2.0 + progress * 1.6 },
            { emoji: '🛰️', radius: 18, speed: 2.2 + progress * 1.6 },
            { emoji: '👾', radius: 16, speed: 2.5 + progress * 1.8 },
          ];
          const choice = types[Math.floor(Math.random() * types.length)];
          const side = Math.random();
          let sx, sy, svx, svy;

          if (side < 0.65) {
            sx = Math.random() * (W - 50) + 25;
            sy = -30;
            svx = (Math.random() - 0.5) * 1.6;
            svy = choice.speed;
          } else if (side < 0.82) {
            sx = -30;
            sy = Math.random() * (H * 0.65) + 20;
            svx = choice.speed * 0.8;
            svy = (Math.random() - 0.2) * 1.5;
          } else {
            sx = W + 30;
            sy = Math.random() * (H * 0.65) + 20;
            svx = -choice.speed * 0.8;
            svy = (Math.random() - 0.2) * 1.5;
          }

          obstaclesRef.current.push({
            x: sx,
            y: sy,
            vx: svx,
            vy: svy,
            radius: choice.radius,
            emoji: choice.emoji,
            angle: 0,
            rotSpeed: (Math.random() - 0.5) * 0.08,
          });
        }

        // B. Spawn Collectibles (Stars & Birthday Gifts)
        if (currentSpawnTimer % 45 === 0) {
          const isGift = Math.random() < 0.35;
          collectiblesRef.current.push({
            x: Math.random() * (W - 60) + 30,
            y: -25,
            vy: 1.8 + Math.random() * 0.7,
            vx: (Math.random() - 0.5) * 0.6,
            type: isGift ? 'gift' : 'star',
            points: isGift ? 50 : 25,
            radius: isGift ? 18 : 15,
            emoji: isGift ? '🎁' : '⭐',
          });
        }

        // C. Spawn Power-Ups
        if (currentSpawnTimer % 240 === 0) {
          const ptypes = ['shield', 'magnet', 'turbo', 'life'];
          const pchoice = ptypes[Math.floor(Math.random() * ptypes.length)];
          const pemojis = { shield: '🧴', magnet: '🧲', turbo: '⚡', life: '💖' };

          powerUpsRef.current.push({
            x: Math.random() * (W - 80) + 40,
            y: -30,
            vy: 1.5,
            type: pchoice,
            emoji: pemojis[pchoice],
            radius: 20,
          });
        }

        // D. Update Spaceship Input
        const up = keysRef.current.up || touchControlsRef.current.up;
        const down = keysRef.current.down || touchControlsRef.current.down;
        const left = keysRef.current.left || touchControlsRef.current.left;
        const right = keysRef.current.right || touchControlsRef.current.right;

        const currentSpeed = ship.turboTimer > 0 ? ship.speed * 1.55 : ship.speed;

        ship.vx = 0;
        ship.vy = 0;

        if (up) ship.vy -= currentSpeed;
        if (down) ship.vy += currentSpeed;
        if (left) {
          ship.vx -= currentSpeed;
          ship.angle = -0.22;
        } else if (right) {
          ship.vx += currentSpeed;
          ship.angle = 0.22;
        } else {
          ship.angle *= 0.8;
        }

        // Particle Trail (strictly positive radii)
        if (up || down || left || right) {
          if (Math.random() < 0.22) audioSystem.playThruster();

          ship.particles.push({
            x: ship.x + ship.width / 2 + (Math.random() - 0.5) * 6,
            y: ship.y + ship.height - 4,
            vx: (Math.random() - 0.5) * 1.2,
            vy: 2.5 + Math.random() * 2,
            life: 1.0,
            size: 4 + Math.random() * 4,
            color: ship.turboTimer > 0 ? '#ec4899' : '#38bdf8',
          });
        }

        ship.x += ship.vx;
        ship.y += ship.vy;

        // Keep within canvas
        ship.x = Math.max(10, Math.min(W - ship.width - 10, ship.x));
        ship.y = Math.max(15, Math.min(H - ship.height - 15, ship.y));

        // Timers countdown
        if (ship.invincibleTimer > 0) ship.invincibleTimer--;
        if (ship.shieldTimer > 0) ship.shieldTimer--;
        if (ship.magnetTimer > 0) ship.magnetTimer--;
        if (ship.turboTimer > 0) ship.turboTimer--;

        const shipCenterX = ship.x + ship.width / 2;
        const shipCenterY = ship.y + ship.height / 2;

        // E. Update Collectibles
        collectiblesRef.current.forEach((col) => {
          if (ship.magnetTimer > 0) {
            const dx = shipCenterX - col.x;
            const dy = shipCenterY - col.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 180) {
              col.x += (dx / dist) * 5.8;
              col.y += (dy / dist) * 5.8;
            }
          }

          col.x += col.vx;
          col.y += col.vy;

          const dist = Math.hypot(shipCenterX - col.x, shipCenterY - col.y);
          if (dist < col.radius + 18) {
            col.collected = true;
            audioSystem.playPickup ? audioSystem.playPickup() : audioSystem.playClick();
            onUpdateScore(col.points);
            scoreRef.current += col.points;
            setDisplayScore(scoreRef.current);
          }
        });
        collectiblesRef.current = collectiblesRef.current.filter((c) => !c.collected && c.y < H + 40 && c.x > -40 && c.x < W + 40);

        // F. Update Power-Ups
        powerUpsRef.current.forEach((pu) => {
          pu.y += pu.vy;
          const dist = Math.hypot(shipCenterX - pu.x, shipCenterY - pu.y);
          if (dist < pu.radius + 18) {
            pu.collected = true;
            audioSystem.playPowerUp ? audioSystem.playPowerUp() : audioSystem.playLevelComplete();

            if (pu.type === 'shield') {
              ship.shieldTimer = 480;
              setActivePowerUpName('🧴 Sunscreen Shield');
              setNotification('SUNSCREEN PROTECTION ACTIVATED! 🧴 (IMMUNITY)');
            } else if (pu.type === 'magnet') {
              ship.magnetTimer = 480;
              setActivePowerUpName('🧲 Star Magnet');
              setNotification('STAR MAGNET ACTIVATED! 🧲 PULLING BEACONS!');
            } else if (pu.type === 'turbo') {
              ship.turboTimer = 360;
              setActivePowerUpName('⚡ Turbo Boost');
              setNotification('TURBO BOOST ACTIVATED! ⚡ SPEED SURGE!');
            } else if (pu.type === 'life') {
              ship.lives = Math.min(3, ship.lives + 1);
              setLives(ship.lives);
              setNotification('EXTRA LIFE RESTORED! 💖');
            }
          }
        });
        powerUpsRef.current = powerUpsRef.current.filter((p) => !p.collected && p.y < H + 40);

        // G. Update Obstacles
        obstaclesRef.current.forEach((obs) => {
          obs.x += obs.vx;
          obs.y += obs.vy;
          obs.angle += obs.rotSpeed;

          if (ship.invincibleTimer <= 0 && ship.shieldTimer <= 0) {
            const dist = Math.hypot(shipCenterX - obs.x, shipCenterY - obs.y);
            if (dist < obs.radius + 16) {
              obs.collided = true;
              audioSystem.playCollision();

              ship.lives -= 1;
              ship.invincibleTimer = 85;
              setLives(ship.lives);

              if (ship.lives <= 0) {
                setGameState('gameover');
                audioSystem.playCollision();
              } else {
                setNotification('HULL HIT! SHIELDS RECHARGING... ⚠️');
              }
            }
          }
        });
        obstaclesRef.current = obstaclesRef.current.filter((o) => !o.collided && o.y < H + 50 && o.y > -60 && o.x > -60 && o.x < W + 60);

        // 2. Draw Particles (strictly safe radius >= 0.5)
        ship.particles = ship.particles.filter((p) => p.life > 0.05);
        ship.particles.forEach((p) => {
          p.life -= 0.04;
          if (p.life <= 0) return;
          p.x += p.vx;
          p.y += p.vy;
          const radius = Math.max(0.5, p.size * p.life);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // 3. Draw Collectibles
        collectiblesRef.current.forEach((col) => {
          ctx.save();
          ctx.translate(col.x, col.y);
          const pulse = Math.sin((Date.now() / 150) + col.x) * 3;

          ctx.fillStyle = col.type === 'gift' ? 'rgba(236, 72, 153, 0.28)' : 'rgba(255, 215, 0, 0.28)';
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(5, col.radius + pulse), 0, Math.PI * 2);
          ctx.fill();

          ctx.font = `${col.radius * 1.6}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(col.emoji, 0, 0);
          ctx.restore();
        });

        // 4. Draw Power-Ups
        powerUpsRef.current.forEach((pu) => {
          ctx.save();
          ctx.translate(pu.x, pu.y);
          const pulse = Math.sin(Date.now() / 120) * 4;

          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(8, pu.radius + pulse), 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(255, 215, 0, 0.28)';
          ctx.fill();

          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(pu.emoji, 0, 0);
          ctx.restore();
        });

        // 5. Draw Obstacles
        obstaclesRef.current.forEach((obs) => {
          ctx.save();
          ctx.translate(obs.x, obs.y);
          ctx.rotate(obs.angle);
          ctx.font = `${obs.radius * 1.6}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(obs.emoji, 0, 0);
          ctx.restore();
        });

        // 6. Draw Vivid Cartoon Spaceship
        ctx.save();
        ctx.translate(ship.x + ship.width / 2, ship.y + ship.height / 2);
        ctx.rotate(ship.angle);

        const isInvincible = ship.invincibleTimer > 0;
        if (!isInvincible || Math.floor(Date.now() / 80) % 2 === 0) {
          // Sunscreen Shield Aura
          if (ship.shieldTimer > 0) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(10, ship.width / 2 + 14), 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
            ctx.fill();
          }

          // Magnet Aura
          if (ship.magnetTimer > 0) {
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(10, ship.width / 2 + 20), 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Booster Flame on back
          const flameSize = 8 + Math.random() * 8 + (ship.turboTimer > 0 ? 8 : 0);
          ctx.fillStyle = ship.turboTimer > 0 ? '#ec4899' : '#f97316';
          ctx.beginPath();
          ctx.moveTo(-7, ship.height / 2 - 4);
          ctx.lineTo(7, ship.height / 2 - 4);
          ctx.lineTo(0, ship.height / 2 - 4 + flameSize);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.moveTo(-3, ship.height / 2 - 4);
          ctx.lineTo(3, ship.height / 2 - 4);
          ctx.lineTo(0, ship.height / 2 - 4 + flameSize * 0.5);
          ctx.closePath();
          ctx.fill();

          // Spaceship Fuselage (Glowing hot pink)
          ctx.fillStyle = '#ff2a85';
          ctx.beginPath();
          ctx.moveTo(0, -ship.height / 2);
          ctx.lineTo(ship.width / 2 - 4, ship.height / 2 - 6);
          ctx.lineTo(-ship.width / 2 + 4, ship.height / 2 - 6);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Wings (Purple arcade wings)
          ctx.fillStyle = '#7c3aed';
          ctx.beginPath();
          ctx.moveTo(-ship.width / 2 + 4, ship.height / 2 - 16);
          ctx.lineTo(-ship.width / 2 - 8, ship.height / 2);
          ctx.lineTo(-ship.width / 2 + 4, ship.height / 2 - 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(ship.width / 2 - 4, ship.height / 2 - 16);
          ctx.lineTo(ship.width / 2 + 8, ship.height / 2);
          ctx.lineTo(ship.width / 2 - 4, ship.height / 2 - 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Cockpit Glass
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, -6, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Akshaya Crown Badge
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👑', 0, -18);
        }

        ctx.restore();
      } catch (err) {
        console.error("ForeheadSpaceRescue render error:", err);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]); // Only depends on gameState!

  const handleRestart = () => {
    initGameObjects();
    shipRef.current = {
      x: 236,
      y: 420,
      vx: 0,
      vy: 0,
      speed: 5.0,
      width: 44,
      height: 44,
      angle: 0,
      lives: 3,
      invincibleTimer: 0,
      shieldTimer: 0,
      magnetTimer: 0,
      turboTimer: 0,
      particles: [],
    };
    spawnTimerRef.current = 0;
    scoreRef.current = 0;
    timeLeftRef.current = 30;
    setTimeLeft(30);
    setDisplayScore(0);
    setLives(3);
    setActivePowerUpName(null);
    setNotification('NASA HAS DECLARED AN EMERGENCY! 🚨 PROTECT THE FOREHEAD!');
    setGameState('playing');
  };

  const isDraggingRef = useRef(false);

  const moveShipToCoords = (clientX, clientY) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const targetX = (clientX - rect.left) * scaleX;
    const targetY = (clientY - rect.top) * scaleY;

    const ship = shipRef.current;
    ship.x = Math.max(10, Math.min(canvas.width - ship.width - 10, targetX - ship.width / 2));
    ship.y = Math.max(15, Math.min(canvas.height - ship.height - 15, targetY - ship.height / 2));
  };

  const handleCanvasTouchMove = (e) => {
    if (e.cancelable) e.preventDefault();
    if (e.touches && e.touches[0]) {
      moveShipToCoords(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleCanvasMouseDown = (e) => {
    isDraggingRef.current = true;
    moveShipToCoords(e.clientX, e.clientY);
  };

  const handleCanvasMouseMove = (e) => {
    if (isDraggingRef.current) {
      moveShipToCoords(e.clientX, e.clientY);
    }
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="arcade-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="retro-badge" style={{ background: 'rgba(236, 72, 153, 0.25)', borderColor: '#ec4899', color: '#ffc6dc' }}>
            LEVEL 2: SURVIVAL ARCADE 🚀
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', color: '#ffd700', marginTop: '4px' }}>
            Forehead Space Rescue
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
            <span>{lives > 0 ? '❤️'.repeat(lives) : '💀 DEAD'}</span>
          </div>

          {/* Level Points */}
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

          {/* 60s Countdown Timer */}
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
            <span>{timeLeft}s SURVIVE</span>
          </div>

          {/* Pause Button */}
          <button
            onClick={togglePause}
            className="audio-ctrl-btn"
            title={gameState === 'paused' ? 'Resume Game' : 'Pause Game'}
          >
            {gameState === 'paused' ? <Play size={15} color="#4ade80" /> : <Pause size={15} />}
          </button>

          {/* Restart Button */}
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

      {/* Dynamic Funny Notification Banner */}
      <div
        style={{
          background: 'rgba(22, 10, 42, 0.92)',
          border: '1px solid rgba(255, 101, 163, 0.45)',
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
        {activePowerUpName && (
          <span
            style={{
              background: '#ec4899',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.62rem',
              fontFamily: 'var(--font-retro)',
              whiteSpace: 'nowrap',
              animation: 'wiggle 1s infinite',
            }}
          >
            {activePowerUpName}
          </span>
        )}
      </div>

      {/* Game Canvas Viewport */}
      <div className="satellite-game-stage">
        <canvas
          ref={canvasRef}
          width={520}
          height={560}
          className="satellite-canvas"
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
            <div className="level-dialogue-content">
              <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>⏸️</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#ffd700', marginBottom: '6px' }}>
                GAME PAUSED
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '16px' }}>
                Catch your breath! The galaxy needs your piloting skills.
              </p>
              <button className="btn-arcade" onClick={togglePause} style={{ padding: '10px 22px' }}>
                <Play size={16} />
                <span>RESUME FLIGHT</span>
              </button>
            </div>
          </div>
        )}

        {/* Victory Celebration Dialogue */}
        {gameState === 'victory' && (
          <div className="level-dialogue-overlay">
            <div className="level-dialogue-content">
              <div style={{ fontSize: '2.5rem', marginBottom: '4px' }}>🏆🚀🎉</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#ffd700', marginBottom: '4px' }}>
                SPACE RESCUE SUCCESSFUL!
              </h3>
              <h4 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.74rem', color: '#4ade80', marginBottom: '10px' }}>
                AKSHAYA HAS SAVED THE GALAXY! 😂
              </h4>

              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  textAlign: 'left',
                  fontSize: '0.78rem',
                  color: '#e2e8f0',
                  lineHeight: '1.45',
                  marginBottom: '10px',
                  maxWidth: '380px',
                }}
              >
                <p>🛰️ <strong>Mission Report:</strong> You survived the 30-second onslaught of meteors, flying slippers, and rogue aliens on Akshaya's forehead space station!</p>
                <p style={{ marginTop: '6px', color: '#ffd700' }}>⭐ Reward: <strong>+200 BASE POINTS</strong> + Collectibles!</p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#ffd700',
                  fontFamily: 'var(--font-retro)',
                  fontSize: '0.82rem',
                  marginBottom: '14px',
                }}
              >
                <Award size={18} color="#ffd700" />
                <span>+{200 + displayScore} TOTAL POINTS AWARDED</span>
              </div>

              <button
                className="btn-arcade btn-gold animate-bounce-slow"
                onClick={() => {
                  audioSystem.playClick();
                  onCompleteLevel();
                }}
                style={{ padding: '12px 24px', fontSize: '0.96rem' }}
              >
                <span>UNLOCK LEVEL 3: DELIVERY DASH</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Game Over Dialogue */}
        {gameState === 'gameover' && (
          <div className="level-dialogue-overlay">
            <div className="level-dialogue-content">
              <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>💥🩴</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#f87171', marginBottom: '6px' }}>
                SPACESHIP DESTROYED!
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '14px', maxWidth: '340px' }}>
                Forehead debris and flying slippers were too intense! Grab the 🧴 Sunscreen Shield and 💖 Extra Lives to survive.
              </p>
              <button className="btn-arcade" onClick={handleRestart} style={{ padding: '10px 22px' }}>
                <RotateCcw size={16} />
                <span>RELAUNCH RESCUE SHIP</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop and Mobile Controls / Progression */}
      <div style={{ marginTop: '14px', textAlign: 'center' }}>
        {gameState === 'victory' ? (
          <button
            className="btn-arcade btn-gold animate-pulse-glow"
            onClick={() => {
              audioSystem.playClick();
              onCompleteLevel();
            }}
            style={{ padding: '14px 28px', width: '100%', maxWidth: '380px' }}
          >
            <span>UNLOCK LEVEL 3: DELIVERY DASH</span>
            <ArrowRight size={20} />
          </button>
        ) : gameState === 'gameover' ? (
          <button
            className="btn-arcade"
            onClick={handleRestart}
            style={{ padding: '14px 28px', width: '100%', maxWidth: '380px' }}
          >
            <RotateCcw size={18} />
            <span>RELAUNCH RESCUE SHIP 🔄</span>
          </button>
        ) : (
          <>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
              Desktop: <kbd>W</kbd>/<kbd>A</kbd>/<kbd>S</kbd>/<kbd>D</kbd> or Arrows | Mobile: Drag on canvas or use D-Pad below
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
          </>
        )}
      </div>
    </div>
  );
}
