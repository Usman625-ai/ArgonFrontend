/**
 * Tiny pub-sub tracker for in-flight API requests.
 *
 * This is intentionally decoupled from Redux — it just needs to answer one
 * question for the UI: "is there a request that has been pending for a
 * while?" It powers <SlowLoadingOverlay />, which only appears once a
 * request has been in flight longer than a threshold, so fast responses
 * never show any extra UI.
 */

type Listener = (pending: number) => void;

let pendingCount = 0;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l(pendingCount));
}

export const loadingBus = {
  start() {
    pendingCount += 1;
    notify();
  },
  end() {
    pendingCount = Math.max(0, pendingCount - 1);
    notify();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    listener(pendingCount);
    return () => listeners.delete(listener);
  },
};