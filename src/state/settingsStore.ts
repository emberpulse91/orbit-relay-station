import { loadRaw, saveRaw } from './storage';

const KEY = 'orbit.settings.v1';

export interface Settings {
  linkPreview: boolean;
  gridCoordinates: boolean;
  highContrastBeams: boolean;
  driftAlerts: boolean;
}

export function defaultSettings(): Settings {
  return {
    linkPreview: true,
    gridCoordinates: false,
    highContrastBeams: false,
    driftAlerts: true,
  };
}

export function parseSettings(raw: string | null): Settings {
  const base = defaultSettings();
  if (!raw) {
    return base;
  }
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') {
      return base;
    }
    return {
      linkPreview: typeof data.linkPreview === 'boolean' ? data.linkPreview : base.linkPreview,
      gridCoordinates:
        typeof data.gridCoordinates === 'boolean' ? data.gridCoordinates : base.gridCoordinates,
      highContrastBeams:
        typeof data.highContrastBeams === 'boolean'
          ? data.highContrastBeams
          : base.highContrastBeams,
      driftAlerts: typeof data.driftAlerts === 'boolean' ? data.driftAlerts : base.driftAlerts,
    };
  } catch (e) {
    return base;
  }
}

export async function loadSettings(): Promise<Settings> {
  return parseSettings(await loadRaw(KEY));
}

export async function persistSettings(s: Settings): Promise<void> {
  await saveRaw(KEY, JSON.stringify(s));
}
