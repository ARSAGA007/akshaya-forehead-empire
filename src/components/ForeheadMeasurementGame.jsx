import React, { useState, useEffect, useRef } from 'react';
import { Compass, RotateCcw, Award, Sparkles, ArrowRight, Scan, Clock } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';
import { fireCelebrationConfetti } from '../utils/confetti';

export default function ForeheadMeasurementGame({ onCompleteLevel, onUpdateScore }) {
  // Ruler vertical position as percentage (0 to 80%)
  const [rulerY, setRulerY] = useState(15);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [measurementResult, setMeasurementResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFailed, setIsFailed] = useState(false);
  const [scanLaserY, setScanLaserY] = useState(null);

  const containerRef = useRef(null);
  const dragStartY = useRef(0);
  const initialRulerY = useRef(15);

  // Target area: between 25% and 55%
  const targetMinY = 25;
  const targetMaxY = 55;
  const isInsideTarget = rulerY >= targetMinY && rulerY <= targetMaxY;

  // Countdown timer
  useEffect(() => {
    if (measurementResult || isFailed) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFailed(true);
          audioSystem.playCollision();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [measurementResult, isFailed]);

  // Touch and Mouse dragging logic
  const handlePointerDown = (e) => {
    if (isScanning || measurementResult) return;
    setIsDragging(true);
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    initialRulerY.current = rulerY;
    audioSystem.playClick();
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dragStartY.current;
    const containerHeight = containerRef.current.clientHeight;
    const deltaPercent = (deltaY / containerHeight) * 100;

    let newY = Math.max(5, Math.min(75, initialRulerY.current + deltaPercent));
    setRulerY(newY);

    if (Math.abs(deltaY) % 20 < 4) {
      audioSystem.playScanBeep();
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleStartMeasurement = () => {
    if (isScanning || measurementResult) return;
    audioSystem.playLaser();
    setIsScanning(true);
    setScanProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      setScanLaserY(progress);

      if (progress % 20 === 0) {
        audioSystem.playScanBeep();
      }

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setScanLaserY(null);

        if (isInsideTarget) {
          // Success!
          audioSystem.playLevelComplete();
          fireCelebrationConfetti();
          onUpdateScore(100);
          setMeasurementResult({
            success: true,
            title: 'ERROR 404: MEASUREMENT LIMIT EXCEEDED! 🚨',
            stats: [
              'Estimated Area: 14,850 Square Kilometers 🗺️',
              'Google Maps Status: Mapping in progress...',
              'Standard Rulers Status: Officially Retired 📐',
              'NASA Warning: Visible from the International Space Station 🛰️',
            ],
            joke: 'Scientists have officially declared this a new sovereign territory!',
          });
        } else {
          // Off target
          audioSystem.playCollision();
          setMeasurementResult({
            success: false,
            title: 'MEASUREMENT MISALIGNED! ❌',
            message: 'You placed the ruler outside the prime forehead perimeter! Align the ruler inside the glowing target zone.',
          });
        }
      }
    }, 50);
  };

  const handleReset = () => {
    setRulerY(15);
    setIsScanning(false);
    setScanProgress(0);
    setMeasurementResult(null);
    setTimeLeft(30);
    setIsFailed(false);
  };

  return (
    <div className="arcade-card" style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Level Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span className="retro-badge" style={{ background: 'rgba(236, 72, 153, 0.25)', borderColor: '#ec4899' }}>
            LEVEL 1: EASY
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', color: '#ffc6dc', marginTop: '4px' }}>
            Forehead Measurement Laboratory 🔬
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: timeLeft < 10 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 0, 0, 0.4)',
              border: `1px solid ${timeLeft < 10 ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
              padding: '6px 14px',
              borderRadius: '12px',
              fontFamily: 'var(--font-retro)',
              fontSize: '0.85rem',
              color: timeLeft < 10 ? '#fca5a5' : '#ffd700',
            }}
          >
            <Clock size={16} />
            <span>{timeLeft}s</span>
          </div>

          <button
            onClick={() => {
              audioSystem.playClick();
              handleReset();
            }}
            className="audio-ctrl-btn"
            title="Reset Measurement"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#d8b4fe', marginBottom: '16px', textAlign: 'center' }}>
        🎯 Drag the precision scientific ruler into the highlighted forehead target zone, then tap <strong>CALCULATE DIMENSIONS</strong>!
      </p>

      {/* Lab Simulation Viewport */}
      <div
        ref={containerRef}
        className="lab-container"
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <img
          src="/assets/akshaya-closeup-1.jpg"
          alt="Akshaya Forehead Lab Specimen"
          className="lab-bg-img"
        />

        {/* Scanlines effect */}
        <div className="lab-overlay-scanline"></div>

        {/* Highlighted Target Forehead Box */}
        <div className="forehead-target-box">
          <div
            style={{
              position: 'absolute',
              top: '-24px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#ff2a85',
              color: '#fff',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-retro)',
              padding: '2px 8px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            {isInsideTarget ? 'ZONE LOCKED! 🎯' : 'TARGET FOREHEAD ZONE'}
          </div>
        </div>

        {/* Scanning Laser Beam animation */}
        {scanLaserY !== null && (
          <div
            style={{
              position: 'absolute',
              top: `${scanLaserY}%`,
              left: 0,
              width: '100%',
              height: '4px',
              background: '#00ffcc',
              boxShadow: '0 0 15px #00ffcc, 0 0 30px #00ffcc',
              zIndex: 30,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: '10px',
                top: '-20px',
                fontFamily: 'var(--font-retro)',
                fontSize: '0.6rem',
                color: '#00ffcc',
              }}
            >
              SCANNING {scanProgress}%
            </div>
          </div>
        )}

        {/* Draggable Measuring Ruler */}
        <div
          className="measurement-ruler"
          style={{
            top: `${rulerY}%`,
            borderColor: isInsideTarget ? '#22c55e' : '#ff2a85',
            boxShadow: isInsideTarget ? '0 0 20px rgba(34, 197, 94, 0.6)' : '0 6px 20px rgba(0,0,0,0.4)',
          }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem' }}>📏</span>
            <span style={{ color: isInsideTarget ? '#15803d' : '#be185d', fontWeight: 800 }}>
              {isInsideTarget ? 'LOCKED IN FOREHEAD ZONE' : 'DRAG TO ALIGN'}
            </span>
          </div>
          <div className="ruler-marks">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className={`ruler-tick ${i % 4 === 0 ? 'major' : 'minor'}`}
                style={{ background: isInsideTarget ? '#16a34a' : undefined }}
              ></div>
            ))}
          </div>
          <span style={{ color: '#6b7280', fontSize: '0.6rem' }}>∞ KM</span>
        </div>

        {/* Scanning active progress bar */}
        {isScanning && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: `${scanProgress}%`,
              height: '6px',
              background: 'linear-gradient(90deg, #ff65a3, #00ffcc)',
              transition: 'width 0.05s linear',
              zIndex: 40,
            }}
          />
        )}

        {/* Result Overlay */}
        {measurementResult && (
          <div className="level-dialogue-overlay">
            {measurementResult.success ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉</div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.4rem',
                    color: '#ffd700',
                    fontWeight: 800,
                    marginBottom: '10px',
                  }}
                >
                  CONGRATULATIONS!
                </h3>
                <h4 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.78rem', color: '#ff65a3', marginBottom: '14px' }}>
                  {measurementResult.title}
                </h4>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    color: '#e2e8f0',
                    lineHeight: '1.6',
                    marginBottom: '16px',
                    width: '100%',
                    maxWidth: '400px',
                  }}
                >
                  {measurementResult.stats.map((s, idx) => (
                    <div key={idx} style={{ marginBottom: '4px' }}>• {s}</div>
                  ))}
                  <p style={{ marginTop: '8px', color: '#a7f3d0', fontStyle: 'italic', fontSize: '0.8rem' }}>
                    "{measurementResult.joke}"
                  </p>
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
                  <span>+100 POINTS AWARDED</span>
                </div>

                <button
                  className="btn-arcade"
                  onClick={() => {
                    audioSystem.playClick();
                    onCompleteLevel();
                  }}
                >
                  <span>NEXT MISSION UNLOCKED</span>
                  <ArrowRight size={18} />
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚠️</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#f87171', marginBottom: '8px' }}>
                  {measurementResult.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '18px', maxWidth: '360px' }}>
                  {measurementResult.message}
                </p>
                <button className="btn-arcade btn-secondary" onClick={handleReset}>
                  <RotateCcw size={16} />
                  <span>RETRY MEASUREMENT</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Failed timeout overlay */}
        {isFailed && !measurementResult && (
          <div className="level-dialogue-overlay">
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⏰</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#f87171', marginBottom: '8px' }}>
              TIME RAN OUT!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '18px' }}>
              Scientists grew impatient waiting for the measurement!
            </p>
            <button className="btn-arcade" onClick={handleReset}>
              <RotateCcw size={16} />
              <span>TRY AGAIN</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '18px', flexWrap: 'wrap' }}>
        <button
          className="btn-arcade"
          disabled={isScanning || !!measurementResult || isFailed}
          onClick={handleStartMeasurement}
          style={{
            padding: '14px 28px',
            opacity: isScanning || !!measurementResult || isFailed ? 0.6 : 1,
          }}
        >
          <Scan size={20} />
          <span>{isScanning ? 'CALCULATING FOREHEAD...' : 'CALCULATE DIMENSIONS 📐'}</span>
        </button>
      </div>
    </div>
  );
}

