/**
 * Tiny persistence adapter. It resolves an async-storage native module when one
 * is linked and otherwise keeps an in-memory map, so a missing or broken native
 * module can never crash the app or the build. UI code never calls this file
 * directly — everything goes through progressStore / settingsStore.
 */
type Backend = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

const memory = new Map<string, string>();

const memoryBackend: Backend = {
  getItem: key => Promise.resolve(memory.has(key) ? (memory.get(key) as string) : null),
  setItem: (key, value) => {
    memory.set(key, value);
    return Promise.resolve();
  },
};

let backend: Backend = memoryBackend;

try {
  const mod = require('@react-native-async-storage/async-storage');
  const candidate = (mod && mod.default) || mod;
  if (candidate && typeof candidate.getItem === 'function') {
    backend = candidate as Backend;
  }
} catch (e) {
  backend = memoryBackend;
}

export async function loadRaw(key: string): Promise<string | null> {
  try {
    return await backend.getItem(key);
  } catch (e) {
    return null;
  }
}

export async function saveRaw(key: string, value: string): Promise<void> {
  try {
    await backend.setItem(key, value);
  } catch (e) {
    // Persistence is best-effort; losing it must never break a round.
  }
}

export function resetMemoryBackend() {
  memory.clear();
}
