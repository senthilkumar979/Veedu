type Listener = (active: boolean) => void;

let navigating = false;
const listeners = new Set<Listener>();

export function isNavigating() {
  return navigating;
}

export function startNavigation() {
  if (navigating) return;
  navigating = true;
  listeners.forEach((listener) => listener(true));
}

export function finishNavigation() {
  if (!navigating) return;
  navigating = false;
  listeners.forEach((listener) => listener(false));
}

export function subscribeNavigation(listener: Listener) {
  listeners.add(listener);
  listener(navigating);
  return () => {
    listeners.delete(listener);
  };
}
