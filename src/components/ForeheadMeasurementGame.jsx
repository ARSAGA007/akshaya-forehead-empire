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

  const rulerYRef = useRef(15);
  const isDraggingRef = useRef(false);
  const dragStartY = useRef(0);
  const initialRulerY = useRef(15);
  const lastBeepTime = useRef(0);

  // Sync ref with rulerY state
  useEffect(() => {
    rulerYRef.current = rulerY;
  }, [rulerY]);

  // Butter-smooth, non-passive touch & mouse dragging listener on container and window
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updatePosition = (clientY) => {
      const rect = container.getBoundingClientRect();
      const deltaY = clientY - dragStartY.current;
      const deltaPercent = (deltaY / rect.height) * 100;
      const newY = Math.max(5, Math.min(75, initialRulerY.current + deltaPercent));
      setRulerY(newY);
      rulerYRef.current = newY;

      const now = Date.now();
      if (Math.abs(deltaY) > 6 && now - lastBeepTime.current > 140) {
        audioSystem.playScanBeep();
        lastBeepTime.current = now;
      }
    };

    // Touch handlers
    const onTouchStart = (e) => {
      if (isScanning || measurementResult) return;
      if (e.cancelable) e.preventDefault();
      isDraggingRef.current = true;
      setIsDragging(true);
      const clientY = e.touches[0].clientY;
      dragStartY.current = clientY;
      initialRulerY.current = rulerYRef.current;
      audioSystem.playClick();
    };

    const onTouchMove = (e) => {
      if (!isDraggingRef.current) return;
      if (e.cancelable) e.preventDefault();
      updatePosition(e.touches[0].clientY);
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    // Mouse handlers
    const onMouseDown = (e) => {
      if (isScanning || measurementResult) return;
      isDraggingRef.current = true;
      setIsDragging(true);
      dragStartY.current = e.clientY;
      initialRulerY.current = rulerYRef.current;
      audioSystem.playClick();
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      updatePosition(e.clientY);
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchEnd, { passive: false });

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);

      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isScanning, measurementResult]);

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
    rulerYRef.current = 15;
    isDraggingRef.current = false;
    setIsDragging(false);
    setIsScanning(false);
    setScanProgress(0);
    setMeasurementResult(null);
    setTimeLeft(30);
    setIsFailed(false);
  };

  return (
    <div className="arcade-card" style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
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
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
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
            <div className="level-dialogue-content">
              {measurementResult.success ? (
                <>
                  <div style={{ fontSize: '2.4rem', marginBottom: '4px' }}>🎉</div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '1.3rem',
                      color: '#ffd700',
                      fontWeight: 800,
                      marginBottom: '4px',
                    }}
                  >
                    CONGRATULATIONS!
                  </h3>
                  <h4 style={{ fontFamily: 'var(--font-retro)', fontSize: '0.74rem', color: '#ff65a3', marginBottom: '10px' }}>
                    {measurementResult.title}
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
                      width: '100%',
                      maxWidth: '380px',
                    }}
                  >
                    {measurementResult.stats.map((s, idx) => (
                      <div key={idx} style={{ marginBottom: '3px' }}>• {s}</div>
                    ))}
                    <p style={{ marginTop: '6px', color: '#a7f3d0', fontStyle: 'italic', fontSize: '0.76rem' }}>
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
                      fontSize: '0.82rem',
                      marginBottom: '14px',
                    }}
                  >
                    <Award size={18} color="#ffd700" />
                    <span>+100 POINTS AWARDED</span>
                  </div>

                  <button
                    className="btn-arcade btn-gold animate-bounce-slow"
                    onClick={() => {
                      audioSystem.playClick();
                      onCompleteLevel();
                    }}
                    style={{ padding: '12px 24px', fontSize: '0.98rem' }}
                  >
                    <span>NEXT MISSION UNLOCKED</span>
                    <ArrowRight size={18} />
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '2.2rem', marginBottom: '6px' }}>⚠️</div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#f87171', marginBottom: '6px' }}>
                    {measurementResult.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '14px', maxWidth: '340px' }}>
                    {measurementResult.message}
                  </p>
                  <button className="btn-arcade btn-secondary" onClick={handleReset} style={{ padding: '10px 22px' }}>
                    <RotateCcw size={16} />
                    <span>RETRY MEASUREMENT</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Failed timeout overlay */}
        {isFailed && !measurementResult && (
          <div className="level-dialogue-overlay">
            <div className="level-dialogue-content">
              <div style={{ fontSize: '2.4rem', marginBottom: '6px' }}>⏰</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: '#f87171', marginBottom: '6px' }}>
                TIME RAN OUT!
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '16px' }}>
                Scientists grew impatient waiting for the measurement!
              </p>
              <button className="btn-arcade" onClick={handleReset} style={{ padding: '10px 22px' }}>
                <RotateCcw size={16} />
                <span>TRY AGAIN</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
        {measurementResult?.success ? (
          <button
            className="btn-arcade btn-gold animate-pulse-glow"
            onClick={() => {
              audioSystem.playClick();
              onCompleteLevel();
            }}
            style={{ padding: '14px 28px', width: '100%', maxWidth: '360px' }}
          >
            <span>NEXT MISSION UNLOCKED</span>
            <ArrowRight size={20} />
          </button>
        ) : (measurementResult && !measurementResult.success) || isFailed ? (
          <button
            className="btn-arcade"
            onClick={handleReset}
            style={{ padding: '14px 28px', width: '100%', maxWidth: '360px' }}
          >
            <RotateCcw size={18} />
            <span>TRY AGAIN 🔄</span>
          </button>
        ) : (
          <button
            className="btn-arcade"
            disabled={isScanning}
            onClick={handleStartMeasurement}
            style={{
              padding: '14px 28px',
              width: '100%',
              maxWidth: '360px',
              opacity: isScanning ? 0.65 : 1,
            }}
          >
            <Scan size={20} />
            <span>{isScanning ? 'CALCULATING FOREHEAD...' : 'CALCULATE DIMENSIONS 📐'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

