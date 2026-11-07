import React from 'react';
import { CheckCircle2, Lock, Sparkles, Compass, Rocket, Bike, Gift } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

export default function LevelIndicator({
  currentScreen,
  completedLevels,
  secretUnlocked,
  onSelectLevel,
}) {
  const levels = [
    { id: 'level1', num: 1, name: 'Measurement', icon: Compass },
    { id: 'level2', num: 2, name: 'Space Rescue', icon: Rocket },
    { id: 'level3', num: 3, name: 'Delivery Dash', icon: Bike },
    { id: 'secret-boss', num: 4, name: 'Secret Boss', icon: Gift, isSecret: true },
  ];

  return (
    <div className="level-strip">
      {levels.map((lvl) => {
        const Icon = lvl.icon;
        const isCompleted = completedLevels.includes(lvl.num);
        const isActive = currentScreen === lvl.id;
        const isLocked = lvl.isSecret ? !secretUnlocked : (lvl.num > 1 && !completedLevels.includes(lvl.num - 1));

        return (
          <button
            key={lvl.id}
            disabled={isLocked && !isCompleted}
            onClick={() => {
              if (!isLocked || isCompleted) {
                audioSystem.playClick();
                onSelectLevel(lvl.id);
              }
            }}
            className={`level-step-chip ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            style={{
              cursor: isLocked && !isCompleted ? 'not-allowed' : 'pointer',
              opacity: isLocked && !isCompleted ? 0.45 : 1,
            }}
          >
            {isCompleted ? (
              <CheckCircle2 size={14} color="#4ade80" />
            ) : isLocked ? (
              <Lock size={14} />
            ) : (
              <Icon size={14} color={isActive ? '#ff65a3' : '#d8b4fe'} />
            )}
            <span>M{lvl.num}: {lvl.name}</span>
          </button>
        );
      })}
    </div>
  );
}

