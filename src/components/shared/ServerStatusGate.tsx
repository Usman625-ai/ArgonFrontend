import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CloudOff, WifiOff, RotateCw } from 'lucide-react';
import { serverStatusBus, type DownReason } from '../../lib/serverStatusBus';
import { API_BASE_URL } from '../../lib/api';

const PING_INTERVAL_MS = 5000;

const COPY: Record<DownReason, { icon: typeof CloudOff; title: string; body: string }> = {
  offline: {
    icon: WifiOff,
    title: "You're offline",
    body: "We can't reach the internet right now. Check your connection — this'll reconnect on its own once you're back.",
  },
  server: {
    icon: CloudOff,
    title: "We'll be right back",
    body: "Our server is waking up or briefly unreachable. This usually takes under a minute — hang tight, we're retrying automatically.",
  },
};

/**
 * Full-screen takeover shown whenever api.ts detects the backend is
 * unreachable (network error / timeout) or the browser has no connection.
 * Mounted once near the root, above <Routes>, so it covers every page —
 * including ones already rendered before the outage happened.
 *
 * While visible it silently pings /actuator/health on an interval; the
 * moment that succeeds, it clears itself and sends the user to "/" fully
 * logged out (api.ts already wiped the stored session when it detected
 * the outage), rather than dropping them back into a stale authenticated
 * view of a page that may have changed underneath them.
 */
export default function ServerStatusGate() {
  const [down, setDown] = useState(false);
  const [reason, setReason] = useState<DownReason | null>(null);
  const [retrying, setRetrying] = useState(false);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsubscribe = serverStatusBus.subscribe((isDown, r) => {
      setDown(isDown);
      setReason(r);
    });
    return () => { unsubscribe(); };
  }, []);

  useEffect(() => {
    const clearPing = () => {
      if (pingTimer.current) { clearInterval(pingTimer.current); pingTimer.current = null; }
    };

    if (!down) { clearPing(); return; }

    const ping = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/actuator/health`, { cache: 'no-store' });
        if (res.ok) {
          clearPing();
          serverStatusBus.reportUp();
          window.location.href = '/';
        }
      } catch {
        // still down, keep polling
      }
    };

    ping();
    pingTimer.current = setInterval(ping, PING_INTERVAL_MS);
    return clearPing;
  }, [down]);

  const handleRetryNow = async () => {
    setRetrying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/actuator/health`, { cache: 'no-store' });
      if (res.ok) {
        serverStatusBus.reportUp();
        window.location.href = '/';
        return;
      }
    } catch {
      // fall through
    }
    setRetrying(false);
  };

  const info = COPY[reason ?? 'server'];
  const Icon = info.icon;

  return (
    <AnimatePresence>
      {down && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background px-6"
          role="alert"
          aria-live="assertive"
        >
          {/* subtle background texture, consistent with the rest of the shop */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{ backgroundImage: 'radial-gradient(hsl(var(--foreground) / 0.035) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
          />

          <div className="relative flex w-full max-w-md flex-col items-center gap-6 text-center">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-luxury-lg"
                animate={reason === 'server' ? { y: [0, -6, 0] } : { x: [0, -4, 4, -4, 0] }}
                transition={{ duration: reason === 'server' ? 1.6 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon className="h-7 w-7" />
              </motion.div>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="font-editorial text-2xl font-medium text-foreground sm:text-3xl">{info.title}</h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{info.body}</p>
            </div>

            <button
              onClick={handleRetryNow}
              disabled={retrying}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-luxury transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <RotateCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Checking…' : 'Try again'}
            </button>

            <p className="text-xs text-muted-foreground/70">Checking automatically every few seconds — no need to keep refreshing.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}