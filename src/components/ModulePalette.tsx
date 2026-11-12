import React, { memo, useCallback } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { moduleSprites } from '../assets';
import { HIT_SLOP } from '../constants/config';
import theme from '../constants/theme';
import { MODULES } from '../game/modules';
import type { ModuleId, RelayModule } from '../game/types';
import { usePressScale } from '../hooks/usePressScale';

interface ChipProps {
  module: RelayModule;
  selected: boolean;
  unlocked: boolean;
  affordable: boolean;
  onSelect: (id: ModuleId) => void;
  onLocked: (module: RelayModule) => void;
}

function ChipBase({
  module,
  selected,
  unlocked,
  affordable,
  onSelect,
  onLocked,
}: ChipProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);

  const handlePress = useCallback(() => {
    if (unlocked) {
      onSelect(module.id);
    } else {
      onLocked(module);
    }
  }, [unlocked, onSelect, onLocked, module]);

  return (
    <Pressable
      style={styles.chipPressable}
      hitSlop={HIT_SLOP}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={module.name}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.chip,
          selected ? styles.chipSelected : null,
          !unlocked ? styles.chipLocked : null,
          unlocked && !affordable ? styles.chipPoor : null,
          { transform: [{ scale }] },
        ]}
      >
        <Image
          source={moduleSprites[module.index]}
          style={styles.chipSprite}
          resizeMode="contain"
        />
        {unlocked ? (
          <View style={styles.costPill}>
            <Text style={styles.costText}>{module.cost}</Text>
          </View>
        ) : (
          <View style={styles.lockPill}>
            <Lock size={14} color={theme.colors.textMuted} strokeWidth={2.2} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const Chip = memo(ChipBase);

interface Props {
  selectedId: ModuleId;
  sectorsCleared: number;
  energy: number;
  onSelect: (id: ModuleId) => void;
  onLocked: (module: RelayModule) => void;
}

function ModulePaletteBase({
  selectedId,
  sectorsCleared,
  energy,
  onSelect,
  onLocked,
}: Props) {
  return (
    <View style={styles.row}>
      {MODULES.map(m => (
        <Chip
          key={m.id}
          module={m}
          selected={m.id === selectedId}
          unlocked={sectorsCleared >= m.unlocksAfterSector}
          affordable={energy >= m.cost}
          onSelect={onSelect}
          onLocked={onLocked}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  chipPressable: { flex: 1, height: 56 },
  chip: {
    width: '100%',
    height: 56,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(16,16,58,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderWidth: 1.5,
    borderColor: theme.colors.beam,
    backgroundColor: 'rgba(65,105,225,0.22)',
  },
  chipLocked: { opacity: 0.4 },
  chipPoor: { opacity: 0.6 },
  chipSprite: { width: 28, height: 28 },
  costPill: {
    marginTop: 3,
    minWidth: 26,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
  },
  costText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    color: theme.colors.textSoft,
  },
  lockPill: {
    marginTop: 3,
    width: 26,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const ModulePalette = memo(ModulePaletteBase);
export default ModulePalette;
