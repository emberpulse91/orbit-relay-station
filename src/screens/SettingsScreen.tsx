import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ArrowLeft, Contrast, Eye, Flame, Grid3x3 } from 'lucide-react-native';
import theme from '../constants/theme';
import type { Settings } from '../state/settingsStore';
import { useSettings, setSetting } from '../hooks/useSettings';
import { resetProgress } from '../hooks/useProgress';
import RoundIconButton from '../components/RoundIconButton';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import StarfieldBackdrop from '../components/StarfieldBackdrop';
import ToggleRow from '../components/ToggleRow';
import { ConfirmOverlay, Toast } from '../components/Overlays';

interface Props {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: Props) {
  const settings = useSettings();
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    },
    [],
  );

  const handleChange = useCallback((name: keyof Settings, value: boolean) => {
    setSetting(name, value);
  }, []);

  const openConfirm = useCallback(() => setConfirm(true), []);
  const closeConfirm = useCallback(() => setConfirm(false), []);
  const doReset = useCallback(() => {
    resetProgress();
    setConfirm(false);
    setToast('STATION LOG WIPED');
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setToast(null), 1400);
  }, []);

  return (
    <StarfieldBackdrop variant="panel">
      <ScreenHeader
        title="STATION SETTINGS"
        subtitle="TUNE THE ROUTING DECK"
        leftSlot={
          <RoundIconButton
            Icon={ArrowLeft}
            onPress={onBack}
            accessibilityLabel="Back to menu"
          />
        }
      />

      <View style={styles.body}>
        <ToggleRow
          name="linkPreview"
          Icon={Eye}
          title="LINK PREVIEW"
          caption="Show the reactor range ring before deploying"
          value={settings.linkPreview}
          accent={theme.colors.beam}
          onChange={handleChange}
        />
        <ToggleRow
          name="gridCoordinates"
          Icon={Grid3x3}
          title="GRID COORDINATES"
          caption="Label the sector grid A-G / 1-9"
          value={settings.gridCoordinates}
          accent={theme.colors.primary}
          onChange={handleChange}
        />
        <ToggleRow
          name="highContrastBeams"
          Icon={Contrast}
          title="HIGH-CONTRAST BEAMS"
          caption="Thicker amber beams for bright screens"
          value={settings.highContrastBeams}
          accent={theme.colors.star}
          onChange={handleChange}
        />
        <ToggleRow
          name="driftAlerts"
          Icon={Flame}
          title="DRIFT ALERTS"
          caption="Flash an asteroid before it drifts. Off is hard mode"
          value={settings.driftAlerts}
          accent={theme.colors.warning}
          onChange={handleChange}
        />

        <View style={styles.danger}>
          <SecondaryButton label="RESET STATION LOG" onPress={openConfirm} danger />
        </View>
      </View>

      <View style={styles.footer}>
        <SecondaryButton label="MENU" onPress={onBack} />
      </View>

      <ConfirmOverlay
        visible={confirm}
        title="RESET STATION LOG?"
        caption="Stars, unlocks and stats are wiped. Settings are kept."
        confirmLabel="CONFIRM RESET"
        cancelLabel="CANCEL"
        onConfirm={doReset}
        onCancel={closeConfirm}
        danger
      />

      <Toast text={toast} />
    </StarfieldBackdrop>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  danger: { marginTop: 14 },
  footer: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12 },
});
