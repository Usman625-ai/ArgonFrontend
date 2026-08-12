/**
 * Tiny pub-sub tracker for backend reachability — mirrors loadingBus.ts.
 *
 * api.ts reports "down" whenever a request fails with NO response at all
 * (network error, timeout, connection refused, CORS-blocked, DNS failure).
 * That's distinct from a normal 4xx/5xx, which means the backend answered
 * fine — those keep flowing through the existing interceptor logic untouched.
 *
 * <ServerStatusGate /> subscribes to this and renders a full-screen takeover
 * whenever isDown is true, so the user never sees a half-broken page.
 */

export type DownReason = 'offline' | 'server';

type Listener = (down: boolean, reason: DownReason | null) => void;

let isDown = false;
let downReason: DownReason | null = null;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l(isDown, downReason));
}

export const serverStatusBus = {
  reportDown(reason: DownReason) {
    isDown = true;
    downReason = reason;
    notify();
  },
  reportUp() {
    if (isDown) {
      isDown = false;
      downReason = null;
      notify();
    }
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    listener(isDown, downReason);
    return () => listeners.delete(listener);
  },
};