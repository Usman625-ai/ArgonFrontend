import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { loadingBus } from '../../lib/loadingBus';

/**
 * Shows a friendly full-screen loader when a request has been pending
 * longer than SHOW_DELAY_MS. Most requests resolve well before that, so
 * this never appears for normal page interactions — only for the rare
 * slow one, where a blank screen would otherwise feel broken.
 */
const SHOW_DELAY_MS = 5 * 60 * 1000; // 5 minutes

const MESSAGES = [
  'Still working on it…',
  'Talking to the server…',
  'Almost there…',
  'Good things take a moment…',
  'Hang tight, nearly done…',
];

export default function SlowLoadingOverlay() {
  const [visible, setVisible] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsubscribe = loadingBus.subscribe((pending) => {
      if (pending > 0) {
        if (!showTimer.current && !messageTimer.current) {
          showTimer.current = setTimeout(() => {
            setMessageIndex(0);
            setVisible(true);
            messageTimer.current = setInterval(() => {
              setMessageIndex((i) => (i + 1) % MESSAGES.length);
            }, 2200);
          }, SHOW_DELAY_MS);
        }
      } else {
        if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
        if (messageTimer.current) { clearInterval(messageTimer.current); messageTimer.current = null; }
        setVisible(false);
      }
    });
    return () => {
      unsubscribe();
      if (showTimer.current) clearTimeout(showTimer.current);
      if (messageTimer.current) clearInterval(messageTimer.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 bg-background/80 backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="relative flex h-24 w-24 items-center justify-center">
            {/* Outer pulsing ring */}
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Spinning dashed ring */}
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary/50"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            {/* Bouncing icon */}
            <motion.div
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-luxury-lg"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShoppingBag className="h-6 w-6" />
            </motion.div>
          </div>

          <div className="flex flex-col items-center gap-1.5 px-6 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium text-foreground"
              >
                {MESSAGES[messageIndex]}
              </motion.p>
            </AnimatePresence>
            <p className="text-xs text-muted-foreground">This is taking a little longer than usual</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}