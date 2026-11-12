import { useSyncExternalStore } from 'react';
import {
  defaultSettings,
  loadSettings,
  persistSettings,
  type Settings,
} from '../state/settingsStore';

let current: Settings = defaultSettings();
let booted = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSettings(): Settings {
  return current;
}

export function bootSettings(): void {
  if (booted) {
    return;
  }
  booted = true;
  loadSettings()
    .then(s => {
      current = s;
      emit();
    })
    .catch(() => {
      // keep the defaults
    });
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  current = { ...current, [key]: value };
  emit();
  persistSettings(current);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings, getSettings);
}
