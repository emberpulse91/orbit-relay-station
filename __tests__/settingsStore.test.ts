import { describe, expect, it } from '@jest/globals';
import { defaultSettings, parseSettings } from '../src/state/settingsStore';

describe('settings store', () => {
  it('ships sensible defaults and no audio option', () => {
    const s = defaultSettings();
    expect(s.linkPreview).toBe(true);
    expect(s.driftAlerts).toBe(true);
    expect(s.gridCoordinates).toBe(false);
    expect(s.highContrastBeams).toBe(false);
    expect(Object.keys(s)).toHaveLength(4);
    expect(Object.keys(s).join(',')).not.toMatch(/sound|music|volume/i);
  });

  it('round-trips a saved payload', () => {
    const saved = { ...defaultSettings(), gridCoordinates: true, driftAlerts: false };
    expect(parseSettings(JSON.stringify(saved))).toEqual(saved);
  });

  it('falls back to defaults on a corrupt or missing payload', () => {
    expect(parseSettings(null)).toEqual(defaultSettings());
    expect(parseSettings('not json')).toEqual(defaultSettings());
    expect(parseSettings('42')).toEqual(defaultSettings());
    expect(parseSettings('{"linkPreview":"yes"}')).toEqual(defaultSettings());
  });
});
