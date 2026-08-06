import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  count?: number;
  className?: string;
}

const COLORS = ['hsl(var(--primary))', '#f5b942', '#e8c9a0', 'hsl(var(--success))', '#d97757'];
const SHAPES = ['rect', 'circle'] as const;

/** One-shot confetti burst radiating from the center of its container. Fires once on mount. */
export default function Confetti({ count = 26, className }: ConfettiProps) {
  const particles = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const distance = 90 + Math.random() * 110;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 40,
      rotate: Math.random() * 360,
      scale: 0.6 + Math.random() * 0.7,
      color: COLORS[i % COLORS.length],
      shape: SHAPES[i % SHAPES.length],
      delay: Math.random() * 0.15,
      duration: 0.9 + Math.random() * 0.6,
    };
  }), [count]);

  return (
    <div className={className} aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{ x: p.x, y: p.y + 60, opacity: 0, scale: p.scale, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: p.shape === 'rect' ? 6 : 7,
            height: p.shape === 'rect' ? 10 : 7,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '9999px' : '2px',
          }}
        />
      ))}
    </div>
  );
}