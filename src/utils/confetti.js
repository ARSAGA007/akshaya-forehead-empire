import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#ff69b4', '#ff1493', '#da70d6'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#a855f7', '#ec4899', '#f43f5e', '#fbbf24'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#ffd700', '#ff69b4', '#c084fc'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

export function fireHeartConfetti() {
  confetti({
    particleCount: 40,
    spread: 70,
    origin: { y: 0.6 },
    shapes: ['star', 'circle'],
    colors: ['#ff1493', '#ff69b4', '#ec4899', '#f472b6', '#ffd700'],
    zIndex: 9999,
  });
}

export function fireContinuousFireworks(durationSeconds = 3) {
  const end = Date.now() + durationSeconds * 1000;
  const colors = ['#ff69b4', '#a855f7', '#fbbf24', '#38bdf8', '#4ade80'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
      zIndex: 9999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

