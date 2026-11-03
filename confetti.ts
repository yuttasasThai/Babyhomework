import confetti from 'canvas-confetti';

export function fireHeroConfetti() {
  // Center star burst
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#f59e0b', '#fbbf24', '#38bdf8', '#ec4899', '#10b981', '#8b5cf6'],
    shapes: ['star', 'circle'],
    scalar: 1.2,
  });

  // Left cannon
  confetti({
    particleCount: 35,
    angle: 60,
    spread: 55,
    origin: { x: 0.05, y: 0.75 },
    colors: ['#fbbf24', '#ec4899', '#3b82f6', '#10b981'],
  });

  // Right cannon
  confetti({
    particleCount: 35,
    angle: 120,
    spread: 55,
    origin: { x: 0.95, y: 0.75 },
    colors: ['#fbbf24', '#ec4899', '#3b82f6', '#10b981'],
  });
}
