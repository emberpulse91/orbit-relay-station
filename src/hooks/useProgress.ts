import { useSyncExternalStore } from 'react';
import {
  defaultProgress,
  loadProgress,
  persistProgress,
  type Progress,
} from '../state/progressStore';

let current: Progress = defaultProgress();
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

export function getProgress(): Progress {
  return current;
}

export function bootProgress(): void {
  if (booted) {
    return;
  }
  booted = true;
  loadProgress()
    .then(p => {
      current = p;
      emit();
    })
    .catch(() => {
      // keep the defaults
    });
}

export function updateProgress(next: Progress): void {
  current = next;
  emit();
  persistProgress(next);
}

export function resetProgress(): void {
  updateProgress(defaultProgress());
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getProgress, getProgress);
}
