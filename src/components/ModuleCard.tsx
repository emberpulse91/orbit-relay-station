import React, { memo, useCallback } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Lock } from 'lucide-react-native';
import { moduleSprites } from '../assets';
import { HIT_SLOP } from '../constants/config';
import theme from '../constants/theme';
import type { ModuleId, RelayModule } from '../game/types';
import { usePressScale } from '../hooks/usePressScale';

interface Props {
  module: RelayModule;
  unlocked: boolean;
  isDefault: boolean;
  width: number;
  onSetDefault: (id: ModuleId) => void;
}

function ModuleCardBase({ module, unlocked, isDefault, width, onSetDefault }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96);
  const handlePress = useCallback(() => {
    if (unlocked) {
      onSetDefault(module.id);
    }
  }, [unlocked, onSetDefault, module.id]);

  return (
    <View style={[styles.card, { width }]}>
      <Image
        source={moduleSprites[module.index]}
        style={[styles.sprite, unlocked ? null : styles.spriteLocked]}
        resizeMode="contain"
      />
      <Text style={styles.name} numberOfLines={1}>
        {unlocked ? module.name : 'LOCKED MODULE'}
      </Text>

      {unlocked ? (
        <>
          <View style={styles.statsRow}>
            <Text style={styles.stat}>RANGE {module.range.toFixed(1)}</Text>
            <Text style={styles.statDot}>·</Text>
            <Text style={styles.stat}>COST {module.cost}</Text>
          </View>
          <Text style={styles.special} numberOfLines={2}>
            {module.special}
          </Text>
          <Pressable
            style={styles.togglePressable}
            hitSlop={HIT_SLOP}
            onPress={handlePress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            accessibilityRole="button"
            accessibilityLabel={
              isDefault ? module.name + ' is the default' : 'Set ' + module.name + ' as default'
            }
          >
            <Animated.View
              pointerEvents="box-none"
              style={[
                styles.toggle,
                isDefault ? styles.toggleOn : null,
                { transform: [{ scale }] },
              ]}
            >
              <View style={styles.toggleRow}>
                {isDefault ? (
                  <View style={styles.toggleIcon}>
                    <Check size={24} color={theme.colors.powered} strokeWidth={2.4} />
                  </View>
                ) : null}
                <Text
                  style={[styles.toggleText, isDefault ? styles.toggleTextOn : null]}
                  numberOfLines={1}
                >
                  {isDefault ? 'DEFAULT' : 'SET DEFAULT'}
                </Text>
              </View>
            </Animated.View>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.lockBadge}>
            <Lock size={24} color={theme.colors.textMuted} strokeWidth={2} />
          </View>
          <Text style={styles.unlockCaption} numberOfLines={2}>
            CLEAR SECTOR {module.unlocksAfterSector} TO UNLOCK
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.tile,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.glass,
    paddingHorizontal: 10,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  sprite: { width: 64, height: 64 },
  spriteLocked: { opacity: 0.18, tintColor: theme.colors.locked },
  name: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.textPrimary,
  },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  stat: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: theme.colors.beam,
  },
  statDot: { fontSize: 10, color: theme.colors.textMuted },
  special: {
    marginTop: 6,
    minHeight: 28,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  togglePressable: { marginTop: 8, width: '100%', height: 44 },
  toggle: {
    width: '100%',
    height: 44,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOn: {
    borderColor: 'rgba(70,232,166,0.5)',
    backgroundColor: 'rgba(70,232,166,0.12)',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  toggleIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  toggleText: {
    fontSize: 11,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.textSoft,
  },
  toggleTextOn: { color: theme.colors.powered },
  lockBadge: {
    marginTop: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(42,51,86,0.45)',
  },
  unlockCaption: {
    marginTop: 10,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});

export const ModuleCard = memo(ModuleCardBase);
export default ModuleCard;
