import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Play } from 'lucide-react-native';
import {
  GRID_FRAME,
  GRID_GAP,
  GRID_W,
  TOAST_MS,
  TOTAL_SECTORS,
  TOTAL_STARS,
} from '../constants/config';
import theme from '../constants/theme';
import { isSectorUnlocked, nextSector, totalStars } from '../state/progressStore';
import { useProgress } from '../hooks/useProgress';
import PrimaryButton from '../components/PrimaryButton';
import RoundIconButton from '../components/RoundIconButton';
import ScreenHeader from '../components/ScreenHeader';
import SectorTile from '../components/SectorTile';
import StarfieldBackdrop from '../components/StarfieldBackdrop';
import { Toast } from '../components/Overlays';

interface Props {
  onBack: () => void;
  onStart: (level: number) => void;
}

export default function LevelSelectScreen({ onBack, onStart }: Props) {
  const progress = useProgress();
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

  const showToast = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const handleTile = useCallback(
    (level: number, locked: boolean) => {
      if (locked) {
        showToast('CLEAR SECTOR ' + level + ' FIRST');
        return;
      }
      onStart(level);
    },
    [onStart, showToast],
  );

  const next = nextSector(progress);
  const stars = totalStars(progress);
  const handleStartNext = useCallback(() => onStart(next), [onStart, next]);

  const rows: React.ReactNode[] = [];
  for (let r = 0; r < 4; r++) {
    const tiles: React.ReactNode[] = [];
    for (let c = 0; c < 3; c++) {
      const level = r * 3 + c;
      if (level >= TOTAL_SECTORS) {
        continue;
      }
      tiles.push(
        <SectorTile
          key={level}
          level={level}
          stars={progress.stars[level] || 0}
          locked={!isSectorUnlocked(progress, level)}
          current={level === next}
          onPress={handleTile}
        />,
      );
    }
    rows.push(
      <View style={styles.row} key={'row' + r}>
        {tiles}
      </View>,
    );
  }

  return (
    <StarfieldBackdrop variant="levels">
      <ScreenHeader
        title="SELECT SECTOR"
        leftSlot={
          <RoundIconButton
            Icon={ArrowLeft}
            onPress={onBack}
            accessibilityLabel="Back to menu"
          />
        }
        rightSlot={
          <Text style={styles.stars}>
            {stars}/{TOTAL_STARS} ★
          </Text>
        }
      />

      <View style={styles.body}>
        <View style={styles.grid}>{rows}</View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={'START SECTOR ' + (next + 1)}
          Icon={Play}
          onPress={handleStartNext}
        />
      </View>

      <Toast text={toast} />
    </StarfieldBackdrop>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid: {
    width: GRID_W,
    padding: GRID_FRAME,
    gap: GRID_GAP,
  },
  row: { flexDirection: 'row', gap: GRID_GAP },
  stars: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.colors.star,
  },
  footer: { paddingHorizontal: 16, paddingBottom: 24, height: 76, justifyContent: 'center' },
});
