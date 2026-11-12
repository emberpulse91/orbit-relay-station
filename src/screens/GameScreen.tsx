import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  CONTROL_BAR_BOTTOM,
  CONTROL_BAR_HEIGHT,
  HINT_VISIBLE_MS,
  TOAST_MS,
} from '../constants/config';
import { iconHome, iconPause } from '../assets';
import theme from '../constants/theme';
import type { ModuleId, RelayModule, RoundStats } from '../game/types';
import { useSector } from '../hooks/useSector';
import { useSettings } from '../hooks/useSettings';
import EnergyMeter from '../components/EnergyMeter';
import FlareTimer from '../components/FlareTimer';
import ModulePalette from '../components/ModulePalette';
import RoundIconButton from '../components/RoundIconButton';
import ScreenHeader from '../components/ScreenHeader';
import SectorBoard from '../components/SectorBoard';
import SecondaryButton from '../components/SecondaryButton';
import StarfieldBackdrop from '../components/StarfieldBackdrop';
import { ConfirmOverlay, HintBanner, Toast } from '../components/Overlays';

interface Props {
  level: number;
  attempt: number;
  sectorsCleared: number;
  defaultModule: ModuleId;
  onGameOver: (stats: RoundStats) => void;
  onLeave: () => void;
}

export default function GameScreen({
  level,
  attempt,
  sectorsCleared,
  defaultModule,
  onGameOver,
  onLeave,
}: Props) {
  const settings = useSettings();
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const round = useSector({
    level,
    attempt,
    sectorsCleared,
    defaultModule,
    onGameOver,
  });

  const {
    sector,
    relays,
    asteroids,
    energy,
    phase,
    msLeft,
    routing,
    selectedModule,
    setSelectedModule,
    selectedRelayId,
    rejectedCell,
    driftWarning,
    lastPlacedId,
    refund,
    tapCell,
    recycle,
    restart,
    pause,
    resume,
  } = round;

  useEffect(() => {
    setHintVisible(true);
    const handle = setTimeout(() => setHintVisible(false), HINT_VISIBLE_MS);
    return () => clearTimeout(handle);
  }, [sector]);

  useEffect(
    () => () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    },
    [],
  );

  const showToast = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const handleCellPress = useCallback(
    (col: number, row: number) => {
      tapCell({ col, row });
    },
    [tapCell],
  );

  const handleLockedModule = useCallback(
    (module: RelayModule) => {
      showToast('UNLOCKS AFTER SECTOR ' + module.unlocksAfterSector);
    },
    [showToast],
  );

  const openLeave = useCallback(() => {
    pause();
    setLeaveOpen(true);
  }, [pause]);

  const cancelLeave = useCallback(() => {
    setLeaveOpen(false);
    resume();
  }, [resume]);

  const [pauseOpen, setPauseOpen] = useState(false);
  const openPause = useCallback(() => {
    pause();
    setPauseOpen(true);
  }, [pause]);
  const closePause = useCallback(() => {
    setPauseOpen(false);
    resume();
  }, [resume]);
  const restartFromPause = useCallback(() => {
    setPauseOpen(false);
    restart();
  }, [restart]);

  const handleRestart = useCallback(() => {
    restart();
    showToast('SECTOR RESET');
  }, [restart, showToast]);

  const domesLit = routing.poweredDomeIndices.length;
  const paused = phase === 'paused';
  const boardEmpty = relays.length === 0;

  return (
    <StarfieldBackdrop variant="game">
      <ScreenHeader
        title={'SECTOR ' + String(level + 1).padStart(2, '0')}
        subtitle={'DOMES ' + domesLit + '/' + sector.domes.length}
        leftSlot={
          <RoundIconButton
            source={iconHome}
            onPress={openLeave}
            accessibilityLabel="Leave sector"
          />
        }
        rightSlot={
          <RoundIconButton
            source={iconPause}
            onPress={openPause}
            accessibilityLabel="Pause"
          />
        }
      />

      <View style={styles.gameArea}>
        <View style={styles.hintSlot}>
          <HintBanner
            visible={hintVisible || boardEmpty}
            text="TAP OPEN SPACE TO DEPLOY A RELAY · LINK THE REACTOR TO EVERY DOME"
          />
        </View>

        <View style={styles.boardWrap}>
          <SectorBoard
            cols={sector.cols}
            rows={sector.rows}
            reactor={sector.reactor}
            domes={sector.domes}
            asteroids={asteroids}
            relays={relays}
            routing={routing}
            selectedRelayId={selectedRelayId}
            rejectedCell={rejectedCell}
            driftWarning={settings.driftAlerts ? driftWarning : []}
            lastPlacedId={lastPlacedId}
            highContrast={settings.highContrastBeams}
            linkPreview={settings.linkPreview}
            gridCoordinates={settings.gridCoordinates}
            resolving={phase === 'resolving'}
            dimmed={paused}
            onCellPress={handleCellPress}
          />
          <View style={styles.timerSlot} pointerEvents="none">
            <FlareTimer
              msLeft={msLeft}
              total={sector.flareWindowMs}
              armed={phase === 'playing'}
            />
          </View>
        </View>
      </View>

      <View style={styles.controlBar}>
        <EnergyMeter energy={energy} budget={sector.budget} />
        <ModulePalette
          selectedId={selectedModule}
          sectorsCleared={sectorsCleared}
          energy={energy}
          onSelect={setSelectedModule}
          onLocked={handleLockedModule}
        />
        <View style={styles.actionRow}>
          <View style={styles.actionSlot}>
            <SecondaryButton
              label={selectedRelayId ? 'RECYCLE +' + refund : 'RECYCLE'}
              onPress={recycle}
              disabled={!selectedRelayId}
            />
          </View>
          <View style={styles.actionSlot}>
            <SecondaryButton label="RESTART SECTOR" onPress={handleRestart} />
          </View>
        </View>
      </View>

      <ConfirmOverlay
        visible={leaveOpen}
        title="LEAVE SECTOR?"
        caption="The current routing will be lost."
        confirmLabel="MENU"
        cancelLabel="KEEP ROUTING"
        onConfirm={onLeave}
        onCancel={cancelLeave}
      />

      <ConfirmOverlay
        visible={pauseOpen}
        title="STATION PAUSED"
        caption={'ENERGY ' + energy + ' / ' + sector.budget}
        confirmLabel="RESUME"
        extraLabel="RESTART SECTOR"
        onExtra={restartFromPause}
        cancelLabel="MENU"
        onConfirm={closePause}
        onCancel={onLeave}
      />

      <Toast text={toast} />
    </StarfieldBackdrop>
  );
}

const styles = StyleSheet.create({
  gameArea: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: CONTROL_BAR_HEIGHT + CONTROL_BAR_BOTTOM + 8,
  },
  hintSlot: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    minHeight: 42,
    justifyContent: 'center',
  },
  boardWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timerSlot: { position: 'absolute', top: 10, right: 10 },
  controlBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: CONTROL_BAR_BOTTOM,
    height: CONTROL_BAR_HEIGHT,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: theme.colors.glassDeep,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 14,
  },
  actionRow: { flexDirection: 'row', gap: 10, height: 48 },
  actionSlot: { flex: 1 },
});
