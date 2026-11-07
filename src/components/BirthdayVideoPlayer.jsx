import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

export default function BirthdayVideoPlayer({ onVideoEnd }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Stop background chiptune and ensure clean audio cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  // Synchronous play for both audio and video in direct user gesture
  const startPlayback = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    audioSystem.stopMusic();
    setIsPlaying(true);

    // 1. Synchronously trigger custom audio within click event stack
    if (audio) {
      audio.currentTime = video.currentTime;
      audio.muted = isMuted;
      audio.volume = 1.0;
      const audioPromise = audio.play();
      if (audioPromise !== undefined) {
        audioPromise.catch(err => {
          console.warn('Audio playback error:', err);
        });
      }
    }

    // 2. Synchronously trigger video
    const videoPromise = video.play();
    if (videoPromise !== undefined) {
      videoPromise.catch(err => {
        console.warn('Video playback error:', err);
      });
    }
  };

  const pausePlayback = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (video) video.pause();
    if (audio) audio.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    audioSystem.playClick();
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  };

  const toggleMute = () => {
    audioSystem.playClick();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  const handleRestart = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    audioSystem.playClick();
    audioSystem.stopMusic();

    video.currentTime = 0;
    if (audio) {
      audio.currentTime = 0;
      audio.muted = isMuted;
      audio.volume = 1.0;
    }

    startPlayback();
  };

  // Continuous loop synchronization: when video loops back to start, restart audio in lockstep
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    // Detect loop wrap-around (currentTime dropped back to beginning)
    if (video.currentTime < lastTimeRef.current && lastTimeRef.current > 1) {
      audio.currentTime = 0;
      if (!audio.paused || isPlaying) {
        audio.play().catch(() => {});
      }
    }
    lastTimeRef.current = video.currentTime;
  };

  const handleEnded = () => {
    // Continuous loop until the user proceeds to the next option
    const video = videoRef.current;
    const audio = audioRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
    setIsPlaying(true);
    if (onVideoEnd) onVideoEnd();
  };

  const handleSeeked = () => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (audio && video) {
      audio.currentTime = video.currentTime;
    }
  };

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      {/* Dedicated HTML5 audio element for synchronized custom video music */}
      <audio
        ref={audioRef}
        src="/assets/video-music.mp3"
        preload="auto"
        loop
      />

      <div
        className="video-wrapper"
        style={{ position: 'relative', cursor: 'pointer' }}
        onClick={togglePlay}
      >
        {/* Loading Indicator */}
        {isLoading && !hasError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0a0515',
              zIndex: 10,
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '4px solid rgba(255,101,163,0.3)',
                borderTopColor: '#ff65a3',
                animation: 'spin 1s infinite linear',
              }}
            />
            <span style={{ fontSize: '0.85rem', color: '#ffc6dc' }}>Loading Akshaya's Secret Reel...</span>
          </div>
        )}

        {/* Video Element: Original audio stream muted, looped */}
        <video
          ref={videoRef}
          src="/assets/akshaya-secret-video.mp4"
          playsInline
          muted
          loop
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onSeeked={handleSeeked}
          className="video-element"
        />

        {/* Glowing Center Play Overlay Button when paused */}
        {!isPlaying && !isLoading && !hasError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(10, 5, 21, 0.45)',
              zIndex: 4,
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff2a85 0%, #ffd700 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 35px rgba(255, 42, 133, 0.85)',
                border: '3px solid #ffffff',
                marginBottom: '10px',
              }}
            >
              <Play size={34} color="#ffffff" style={{ marginLeft: '4px' }} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-retro)',
                fontSize: '0.82rem',
                color: '#ffd700',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                letterSpacing: '1px',
              }}
            >
              TAP TO PLAY WITH MUSIC 🎵
            </span>
          </div>
        )}

        {/* Error Fallback */}
        {hasError && (
          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              background: '#1a0d2e',
              color: '#f87171',
            }}
          >
            <AlertCircle size={36} style={{ margin: '0 auto 10px auto' }} />
            <h4>Could not load the secret video asset.</h4>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px' }}>
              Ensure /assets/akshaya-secret-video.mp4 exists in public folder.
            </p>
          </div>
        )}
      </div>

      {/* Control Buttons Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginTop: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          className="btn-arcade"
          onClick={togglePlay}
          style={{ padding: '12px 28px', fontSize: '1rem', minWidth: '160px' }}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY VIDEO 🎵'}</span>
        </button>

        <button className="audio-ctrl-btn" onClick={handleRestart} title="Replay Video">
          <RotateCcw size={18} />
        </button>

        <button className="audio-ctrl-btn" onClick={toggleMute} title={isMuted ? 'Unmute Audio' : 'Mute Audio'}>
          {isMuted ? <VolumeX size={18} color="#f87171" /> : <Volume2 size={18} color="#4ade80" />}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
