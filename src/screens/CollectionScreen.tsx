import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { SCREEN_W } from '../constants/config';
import theme from '../constants/theme';
import { MODULES } from '../game/modules';
import type { ModuleId } from '../game/types';
import { sectorsCleared as countCleared } from '../state/progressStore';
import { useProgress, updateProgress } from '../hooks/useProgress';
import ModuleCard from '../components/ModuleCard';
import RoundIconButton from '../components/RoundIconButton';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import StarfieldBackdrop from '../components/StarfieldBackdrop';

interface Props {
  onBack: () => void;
}

export default function CollectionScreen({ onBack }: Props) {
  const progress = useProgress();
  const cleared = countCleared(progress);

  const cardWidth = useMemo(
    () => Math.floor((Math.min(SCREEN_W - 32, 380) - 12) / 2),
    [],
  );

  const unlockedCount = MODULES.filter(m => cleared >= m.unlocksAfterSector).length;

  const handleSetDefault = useCallback(
    (id: ModuleId) => {
      updateProgress({ ...progress, defaultModule: id });
    },
    [progress],
  );

  return (
    <StarfieldBackdrop variant="panel">
      <ScreenHeader
        title="RELAY MODULES"
        subtitle="PICK YOUR DEFAULT LOADOUT"
        leftSlot={
          <RoundIconButton
            Icon={ArrowLeft}
            onPress={onBack}
            accessibilityLabel="Back to menu"
          />
        }
        rightSlot={
          <Text style={styles.counter}>{unlockedCount}/{MODULES.length}</Text>
        }
      />

      <View style={styles.body}>
        <View style={styles.grid}>
          {MODULES.map(m => (
            <ModuleCard
              key={m.id}
              module={m}
              width={cardWidth}
              unlocked={cleared >= m.unlocksAfterSector}
              isDefault={progress.defaultModule === m.id}
              onSetDefault={handleSetDefault}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <SecondaryButton label="MENU" onPress={onBack} />
      </View>
    </StarfieldBackdrop>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  counter: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.colors.secondary,
  },
  footer: { paddingHorizontal: 16, paddingBottom: 24 },
});
