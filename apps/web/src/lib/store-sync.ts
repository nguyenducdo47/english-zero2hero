/** Client-only helpers for useSyncExternalStore subscriptions. */

export function listenStorageKey(key: string, onChange: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === key || e.key === null) onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function listenWindowEvent(eventName: string, onChange: () => void) {
  window.addEventListener(eventName, onChange);
  return () => window.removeEventListener(eventName, onChange);
}

export function emitStoreChange(eventName: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(eventName));
}
