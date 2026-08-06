import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface P { rating: number; size?: number; interactive?: boolean; onChange?: (r: number) => void; className?: string; }

export default function StarRating({ rating, size = 16, interactive = false, onChange, className }: P) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [justSet, setJustSet] = useState<number | null>(null);
  const display = hovered ?? rating;

  const handleClick = (s: number) => {
    if (!interactive) return;
    onChange?.(s);
    setJustSet(s);
    setTimeout(() => setJustSet(null), 400);
  };

  return (
    <div className={cn('flex items-center gap-0.5', className)} onMouseLeave={() => interactive && setHovered(null)}>
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= Math.round(display);
        return (
          <motion.button
            key={s}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(s)}
            onMouseEnter={() => interactive && setHovered(s)}
            whileTap={interactive ? { scale: 1.4 } : undefined}
            whileHover={interactive ? { scale: 1.2 } : undefined}
            animate={justSet !== null && s <= justSet ? { scale: [1, 1.35, 1], rotate: [0, -12, 0] } : { scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: justSet !== null ? (s - 1) * 0.04 : 0 }}
            className={cn(interactive ? 'cursor-pointer' : 'cursor-default')}
          >
            <Star size={size} className={cn('transition-colors duration-150', filled ? 'fill-warning text-warning' : 'fill-muted text-muted-foreground')} />
          </motion.button>
        );
      })}
    </div>
  );
}
