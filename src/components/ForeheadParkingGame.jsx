import React, { useState, useEffect, useRef } from 'react';
import { Car, RotateCcw, Award, ArrowRight, Clock, Sparkles, Volume2, ShieldCheck, Flame, Navigation } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';
import { fireCelebrationConfetti } from '../utils/confetti';

export default function ForeheadParkingGame({ onCompleteLevel, onUpdateScore, totalScore }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('playing'); // playing, completed, timeout
  const [timeLeft, setTimeLeft] = useState(50);
  const [parkedCount, setParkedCount] = useState(0);
  const [currentRadio, setCurrentRadio] = useState("CHENNAI VALET: Welcome to Chennai's biggest multi-level forehead parking complex!");
  const [activeCarInfo, setActiveCarInfo] = useState(null);

  const bgImageRef = useRef(null);
  const draggedCarIdx = useRef(null);
  const mouseOffset = useRef({ x: 0, y: 0 });

  // 4 creative vehicles positioned over her forehead
  const parkingSlots = [
    { id: 1, x: 45, y: 310, width: 85, height: 110, color: '#f43f5e', name: 'VIP PINK BAY', emoji: '👑', req: 'Royal Limousine' },
    { id: 2, x: 155, y: 305, width: 85, height: 110, color: '#fbbf24', name: 'AUTO STAND', emoji: '🛺', req: 'Chennai Auto' },
    { id: 3, x: 265, y: 305, width: 85, height: 110, color: '#38bdf8', name: 'CAKE LOADING', emoji: '🎂', req: 'Cake Van' },
    { id: 4, x: 375, y: 310, width: 85, height: 110, color: '#4ade80', name: 'VALET SCOOTER', emoji: '🛵', req: 'Valet Bike' },
  ];

  const carsRef = useRef([
    {
      id: 1,
      x: 45,
      y: 50,
      width: 58,
      height: 96,
      color: '#f43f5e',
      model: "Akshaya's Pink Supercar 🏎️",
      parked: false,
      slotId: 1,
      angle: 0,
      lightsOn: false,
    },
    {
      id: 2,
      x: 160,
      y: 55,
      width: 54,
      height: 85,
      color: '#fbbf24',
      model: 'Chennai Auto Rickshaw 🛺',
      parked: false,
      slotId: 2,
      angle: 0,
      lightsOn: false,
    },
    {
      id: 3,
      x: 275,
      y: 50,
      width: 58,
      height: 92,
      color: '#38bdf8',
      model: 'Birthday Cake Express 🎂',
      parked: false,
      slotId: 3,
      angle: 0,
      lightsOn: false,
    },
    {
      id: 4,
      x: 390,
      y: 60,
      width: 48,
      height: 78,
      color: '#4ade80',
      model: 'Fast Delivery Scooter 🛵',
      parked: false,
      slotId: 4,
      angle: 0,
      lightsOn: false,
    },
  ]);

  const radioCommentary = [
    "CHENNAI VALET: 'FastTag Scanned! Toll fee: ₹0 for Birthday Queen!' 🎟️",
    "CHENNAI POLICE: 'Traffic on forehead flowing smoothly! Valet approved.' 🚓",
    "AUTO ANNA: 'Meter podalaama, Akshaya? Forehead parking is supreme!' 🛺",
    "CORPORATION REPORT: 'Valet complex capacity: Unlimited vehicles!' 🏬",
  ];

  // Preload photo
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/akshaya-closeup-1.jpg';
    img.onload = () => {
      bgImageRef.current = img;
    };
  }, []);

  // Timer
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

  // Main canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // 1. Draw Akshaya's Photo as background
      if (bgImageRef.current) {
        ctx.drawImage(bgImageRef.current, 0, 0, W, H);
        ctx.fillStyle = 'rgba(12, 6, 26, 0.42)';
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.fillStyle = '#170c2a';
        ctx.fillRect(0, 0, W, H);
      }

      // 2. Animated Forehead Highway Deck
      ctx.save();
      ctx.fillStyle = 'rgba(255, 42, 133, 0.2)';
      ctx.fillRect(25, 265, 455, 195);
      ctx.strokeStyle = '#ff65a3';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(25, 265, 455, 195);

      // Neon road dividing lines
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(35, 298); ctx.lineTo(470, 298);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '9.5px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.85)';
      ctx.shadowBlur = 4;
      ctx.fillText('AKSHAYA FOREHEAD MULTI-STOREY VALET 🚗', 252, 286);
      ctx.shadowBlur = 0;
      ctx.restore();

      // 3. Draw Parking Slots
      parkingSlots.forEach((slot) => {
        const matchingCar = carsRef.current.find((c) => c.slotId === slot.id);
        const isFilled = matchingCar && matchingCar.parked;

        // Slot area
        ctx.fillStyle = isFilled ? 'rgba(34, 197, 94, 0.35)' : 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(slot.x, slot.y, slot.width, slot.height);

        // Parking boundary lines
        ctx.strokeStyle = isFilled ? '#22c55e' : slot.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(slot.x, slot.y, slot.width, slot.height);

        // Slot icon & emoji
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(slot.emoji, slot.x + slot.width / 2, slot.y + 26);

        ctx.font = '7.5px "Press Start 2P", monospace';
        ctx.fillStyle = isFilled ? '#86efac' : '#fff';
        ctx.fillText(slot.name, slot.x + slot.width / 2, slot.y + 45);

        if (isFilled) {
          ctx.font = '8px "Press Start 2P", monospace';
          ctx.fillStyle = '#4ade80';
          ctx.fillText('LOCKED! 🔒', slot.x + slot.width / 2, slot.y + slot.height - 12);
        } else {
          // Animated guiding down arrow
          const bob = Math.sin((Date.now() / 200) + slot.id) * 3;
          ctx.font = '14px sans-serif';
          ctx.fillStyle = '#ffd700';
          ctx.fillText('⬇️', slot.x + slot.width / 2, slot.y + slot.height - 18 + bob);
        }
      });

      // 4. Draw Cars & Headlights
      carsRef.current.forEach((car) => {
        ctx.save();
        ctx.translate(car.x + car.width / 2, car.y + car.height / 2);
        ctx.rotate(car.angle);

        // Headlight beams shining onto forehead
        if (car.lightsOn || car.parked) {
          ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
          ctx.beginPath();
          ctx.moveTo(-car.width / 2 + 5, car.height / 2);
          ctx.lineTo(-car.width / 2 - 12, car.height / 2 + 35);
          ctx.lineTo(car.width / 2 + 12, car.height / 2 + 35);
          ctx.lineTo(car.width / 2 - 5, car.height / 2);
          ctx.closePath();
          ctx.fill();
        }

        // Car Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(2, 4, car.width / 2, car.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Car Body
        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.roundRect(-car.width / 2, -car.height / 2, car.width, car.height, 12);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Windshield
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-car.width / 2 + 6, -car.height / 2 + 18, car.width - 12, 22, 4);
        ctx.fill();

        // Rear window
        ctx.beginPath();
        ctx.roundRect(-car.width / 2 + 6, car.height / 2 - 26, car.width - 12, 14, 4);
        ctx.fill();

        // Headlights
        ctx.fillStyle = car.lightsOn || car.parked ? '#ffff00' : '#fef08a';
        ctx.fillRect(-car.width / 2 + 5, car.height / 2 - 6, 8, 4);
        ctx.fillRect(car.width / 2 - 13, car.height / 2 - 6, 8, 4);

        // Roof badge / Number
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${car.slotId}`, 0, 0);

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  // Handle Dragging
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e) => {
    if (gameState !== 'playing') return;
    const pos = getCanvasCoords(e);

    for (let i = carsRef.current.length - 1; i >= 0; i--) {
      const car = carsRef.current[i];
      if (
        pos.x >= car.x &&
        pos.x <= car.x + car.width &&
        pos.y >= car.y &&
        pos.y <= car.y + car.height
      ) {
        draggedCarIdx.current = i;
        mouseOffset.current = { x: pos.x - car.x, y: pos.y - car.y };
        car.lightsOn = true;
        setActiveCarInfo(car.model);
        audioSystem.playClick();
        break;
      }
    }
  };

  const handlePointerMove = (e) => {
    if (draggedCarIdx.current === null || gameState !== 'playing') return;
    const pos = getCanvasCoords(e);
    const car = carsRef.current[draggedCarIdx.current];

    car.x = Math.max(10, Math.min(490 - car.width, pos.x - mouseOffset.current.x));
    car.y = Math.max(10, Math.min(540 - car.height, pos.y - mouseOffset.current.y));

    // Snapping into matching colored bay
    const targetSlot = parkingSlots.find((s) => s.id === car.slotId);
    if (targetSlot) {
      const overlapX = Math.abs(car.x + car.width / 2 - (targetSlot.x + targetSlot.width / 2));
      const overlapY = Math.abs(car.y + car.height / 2 - (targetSlot.y + targetSlot.height / 2));

      // Generous, satisfying snapping
      if (overlapX < 50 && overlapY < 50 && !car.parked) {
        car.x = targetSlot.x + (targetSlot.width - car.width) / 2;
        car.y = targetSlot.y + (targetSlot.height - car.height) / 2;
        car.parked = true;
        car.lightsOn = true;
        draggedCarIdx.current = null;

        audioSystem.playCarHonk();

        const newCount = carsRef.current.filter((c) => c.parked).length;
        setParkedCount(newCount);
        setCurrentRadio(radioCommentary[(newCount - 1) % radioCommentary.length]);

        if (newCount === carsRef.current.length) {
          setTimeout(() => {
            audioSystem.playLevelComplete();
            fireCelebrationConfetti();
            onUpdateScore(300);
            setGameState('completed');
          }, 350);
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (draggedCarIdx.current !== null) {
      const car = carsRef.current[draggedCarIdx.current];
      if (!car.parked) car.lightsOn = false;
    }
    draggedCarIdx.current = null;
  };

  const handleHonkAll = () => {
    audioSystem.playCarHonk();
  };

  const handleRestart = () => {
    carsRef.current = [
      { id: 1, x: 45, y: 50, width: 58, height: 96, color: '#f43f5e', model: "Akshaya's Pink Supercar 🏎️", parked: false, slotId: 1, angle: 0, lightsOn: false },
      { id: 2, x: 160, y: 55, width: 54, height: 85, color: '#fbbf24', model: 'Chennai Auto Rickshaw 🛺', parked: false, slotId: 2, angle: 0, lightsOn: false },
      { id: 3, x: 275, y: 50, width: 58, height: 92, color: '#38bdf8', model: 'Birthday Cake Express 🎂', parked: false, slotId: 3, angle: 0, lightsOn: false },
      { id: 4, x: 390, y: 60, width: 48, height: 78, color: '#4ade80', model: 'Fast Delivery Scooter 🛵', parked: false, slotId: 4, angle: 0, lightsOn: false },
    ];
    setTimeLeft(50);
    setParkedCount(0);
    setActiveCarInfo(null);
    setGameState('playing');
    setCurrentRadio("CHENNAI VALET: Welcome to Chennai's biggest multi-level forehead parking complex!");
  };

  return (
    <div className="arcade-card" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="retro-badge" style={{ background: 'rgba(56, 189, 248, 0.25)', borderColor: '#38bdf8' }}>
            LEVEL 3: CHENNAI FOREHEAD VALET 🚗
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', color: '#bae6fd', marginTop: '4px' }}>
            Forehead Parking Plaza
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '5px 10px',
              borderRadius: '12px',
              fontFamily: 'var(--font-retro)',
              fontSize: '0.74rem',
              color: '#4ade80',
            }}
          >
            <span>PARKED: {parkedCount}/4</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: timeLeft < 10 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 0, 0, 0.4)',
              border: `1px solid ${timeLeft < 10 ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
              padding: '5px 10px',
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
            title="Restart Parking"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Chennai Radio Announcement Ticker */}
      <div
        style={{
          background: 'rgba(22, 10, 42, 0.9)',
          border: '1px solid rgba(255, 101, 163, 0.4)',
          borderRadius: '12px',
          padding: '7px 14px',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: '#fef08a',
          gap: '8px',
        }}
      >
        <span style={{ fontFamily: 'var(--font-retro)', fontSize: '0.66rem' }}>📢 {currentRadio}</span>
        <button
          onClick={handleHonkAll}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '9999px',
            padding: '3px 10px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-heading)',
            whiteSpace: 'nowrap',
          }}
          title="Sound Car Horn"
        >
          🔊 HONK!
        </button>
      </div>

      {/* Parking Stage */}
      <div className="parking-game-stage">
        <canvas
          ref={canvasRef}
          width={500}
          height={550}
          className="parking-canvas"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />

        {/* Completion Modal */}
        {gameState === 'completed' && (
          <div className="level-dialogue-overlay">
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🏎️🛺🎉</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#ffd700', marginBottom: '6px' }}>
              ALL VEHICLES VALET PARKED! 🚗
            </h3>
            <h4 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.8rem', color: '#4ade80', marginBottom: '14px' }}>
              CHENNAI POLICE ISSUES 5-STAR VALET CERTIFICATE!
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
                marginBottom: '16px',
                maxWidth: '380px',
              }}
            >
              <p>🏢 <strong>Valet Summary:</strong> The Limousine, Auto Rickshaw, Birthday Cake Van, and Valet Bike are all securely parked across Akshaya's legendary forehead plaza!</p>
              <p style={{ marginTop: '6px', color: '#ffd700' }}>⭐ Level 3 Bonus: <strong>+300 PTS</strong></p>
              <p style={{ marginTop: '4px', color: '#86efac', fontWeight: 700 }}>
                🎯 Total Accumulated Arcade Score: {totalScore + 300} PTS!
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

        {/* Timeout Modal */}
        {gameState === 'timeout' && (
          <div className="level-dialogue-overlay">
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🚨</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: '#f87171', marginBottom: '8px' }}>
              VALET SHIFT ENDED!
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '20px' }}>
              Traffic jammed while waiting! Drag each vehicle down to its matching colored slot on her forehead.
            </p>
            <button className="btn-arcade" onClick={handleRestart}>
              <RotateCcw size={16} />
              <span>TRY AGAIN</span>
            </button>
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '10px', textAlign: 'center' }}>
        👆 Drag each vehicle (1: Pink Supercar, 2: Auto, 3: Cake Van, 4: Scooter) straight down into its matching numbered bay!
      </p>
    </div>
  );
}
