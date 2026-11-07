import React, { useState, useEffect } from 'react';
import ArcadeHeader from './components/ArcadeHeader';
import LevelIndicator from './components/LevelIndicator';
import WelcomeScreen from './components/WelcomeScreen';
import IntroductionScreen from './components/IntroductionScreen';
import ForeheadMeasurementGame from './components/ForeheadMeasurementGame';
import ForeheadSpaceRescueGame from './components/ForeheadSpaceRescueGame';
import BirthdayDeliveryDashGame from './components/BirthdayDeliveryDashGame';
import SecretBossScreen from './components/SecretBossScreen';
import FinalCelebration from './components/FinalCelebration';
import { audioSystem } from './utils/audioSystem';

export default function App() {
  // Session persistence
  const [currentScreen, setCurrentScreen] = useState(() => {
    return sessionStorage.getItem('akshaya_screen') || 'welcome';
  });
  const [completedLevels, setCompletedLevels] = useState(() => {
    const saved = sessionStorage.getItem('akshaya_completed');
    return saved ? JSON.parse(saved) : [];
  });
  const [score, setScore] = useState(() => {
    const saved = sessionStorage.getItem('akshaya_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isMuted, setIsMuted] = useState(false);

  // Sync to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('akshaya_screen', currentScreen);
    sessionStorage.setItem('akshaya_completed', JSON.stringify(completedLevels));
    sessionStorage.setItem('akshaya_score', score.toString());
  }, [currentScreen, completedLevels, score]);

  // Scroll to absolute top immediately whenever screen changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const frameId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => cancelAnimationFrame(frameId);
  }, [currentScreen]);

  const secretUnlocked = completedLevels.includes(1) && completedLevels.includes(2) && completedLevels.includes(3);

  // Audio mute toggle
  const handleToggleMute = () => {
    const muted = audioSystem.toggleMute();
    setIsMuted(muted);
  };

  // Score updater
  const handleUpdateScore = (points) => {
    setScore((prev) => prev + points);
  };

  // Progression handlers with instant scroll-to-top
  const scrollToPageTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleStartChallenge = () => {
    scrollToPageTop();
    setCurrentScreen('intro');
  };

  const handleAcceptMission = () => {
    scrollToPageTop();
    setCurrentScreen('level1');
  };

  const handleCompleteLevel1 = () => {
    if (!completedLevels.includes(1)) {
      setCompletedLevels((prev) => [...prev, 1]);
    }
    scrollToPageTop();
    setCurrentScreen('level2');
  };

  const handleCompleteLevel2 = () => {
    if (!completedLevels.includes(2)) {
      setCompletedLevels((prev) => [...prev, 2]);
    }
    scrollToPageTop();
    setCurrentScreen('level3');
  };

  const handleCompleteLevel3 = () => {
    if (!completedLevels.includes(3)) {
      setCompletedLevels((prev) => [...prev, 3]);
    }
    // Proceeds straight to Secret Boss Level 4
    scrollToPageTop();
    setCurrentScreen('secret-boss');
  };

  const handleProceedToFinalCelebration = () => {
    if (!completedLevels.includes(4)) {
      setCompletedLevels((prev) => [...prev, 4]);
    }
    scrollToPageTop();
    setCurrentScreen('final');
  };

  const handleSelectLevel = (levelId) => {
    scrollToPageTop();
    setCurrentScreen(levelId);
  };

  const handlePlayAgain = () => {
    audioSystem.playClick();
    if (audioSystem.audioElement) {
      audioSystem.audioElement.currentTime = 0;
    }
    setScore(0);
    setCompletedLevels([]);
    sessionStorage.clear();
    scrollToPageTop();
    setCurrentScreen('welcome');
  };

  const handleWatchVideoAgain = () => {
    audioSystem.playClick();
    scrollToPageTop();
    setCurrentScreen('secret-boss');
  };

  const handleGoHome = () => {
    scrollToPageTop();
    setCurrentScreen('welcome');
  };

  return (
    <>
      {/* Dynamic ambient particles in background */}
      <div className="ambient-bg">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
        <div className="floating-orb floating-orb-3" />
      </div>

      <div className="game-container">
        {/* Top arcade header */}
        <ArcadeHeader
          currentScreen={currentScreen}
          score={score}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onGoHome={handleGoHome}
        />

        {/* Level step selector / indicator (shown during levels) */}
        {currentScreen !== 'welcome' && (
          <LevelIndicator
            currentScreen={currentScreen}
            completedLevels={completedLevels}
            secretUnlocked={secretUnlocked}
            onSelectLevel={handleSelectLevel}
          />
        )}

        {/* Screen switcher */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', width: '100%' }}>
          {currentScreen === 'welcome' && (
            <WelcomeScreen onStartChallenge={handleStartChallenge} />
          )}

          {currentScreen === 'intro' && (
            <IntroductionScreen onAcceptMission={handleAcceptMission} />
          )}

          {currentScreen === 'level1' && (
            <ForeheadMeasurementGame
              onCompleteLevel={handleCompleteLevel1}
              onUpdateScore={handleUpdateScore}
            />
          )}

          {currentScreen === 'level2' && (
            <ForeheadSpaceRescueGame
              onCompleteLevel={handleCompleteLevel2}
              onUpdateScore={handleUpdateScore}
            />
          )}

          {currentScreen === 'level3' && (
            <BirthdayDeliveryDashGame
              onCompleteLevel={handleCompleteLevel3}
              onUpdateScore={handleUpdateScore}
              totalScore={score}
            />
          )}

          {currentScreen === 'secret-boss' && (
            <SecretBossScreen
              onProceedToFinalCelebration={handleProceedToFinalCelebration}
            />
          )}

          {currentScreen === 'final' && (
            <FinalCelebration
              totalScore={score}
              onPlayAgain={handlePlayAgain}
              onWatchVideoAgain={handleWatchVideoAgain}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />
          )}
        </main>
      </div>
    </>
  );
}

