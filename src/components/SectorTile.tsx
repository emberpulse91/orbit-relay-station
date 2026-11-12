import React, { memo, useCallback } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Lock, Star } from 'lucide-react-native';
import { HIT_SLOP, SECTOR_TILE } from '../constants/config';
import theme from '../constants/theme';
import { difficultyBand } from '../game/levels';
import { usePressScale } from '../hooks/usePressScale';

const BAND_COLOR = {
  low: theme.colors.primary,
  mid: theme.colors.secondary,
  high: theme.colors.warning,
};

interface Props {
  level: number;
  stars: number;
  locked: boolean;
  current: boolean;
  onPress: (level: number, locked: boolean) => void;
}

function SectorTileBase({ level, stars, locked, current, onPress }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);
  const handlePress = useCallback(() => onPress(level, locked), [level, locked, onPress]);
  const accent = BAND_COLOR[difficultyBand(level)];

  return (
    <Pressable
      style={styles.pressable}
      hitSlop={HIT_SLOP}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={'Sector ' + (level + 1)}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.tile,
          locked ? styles.locked : null,
          current ? styles.current : null,
          { transform: [{ scale }] },
        ]}
      >
        {locked ? (
          <Lock size={20} color={theme.colors.textMuted} strokeWidth={2} />
        ) : (
          <>
            <Text style={styles.number}>{level + 1}</Text>
            <View style={styles.stars}>
              {[0, 1, 2].map(i => (
                <Star
                  key={i}
                  size={12}
                  color={i < stars ? theme.colors.star : theme.colors.locked}
                  fill={i < stars ? theme.colors.star : 'transparent'}
                  strokeWidth={2}
                />
              ))}
            </View>
          </>
        )}
        <View style={[styles.band, { backgroundColor: accent }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: SECTOR_TILE, height: SECTOR_TILE },
  tile: {
    width: SECTOR_TILE,
    height: SECTOR_TILE,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: 'rgba(65,105,225,0.40)',
    backgroundColor: 'rgba(16,16,58,0.70)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  locked: { opacity: 0.45, borderColor: 'rgba(255,255,255,0.06)' },
  current: { borderColor: theme.colors.beam, borderWidth: 1.5 },
  number: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  stars: { flexDirection: 'row', gap: 3, marginTop: 6 },
  band: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3 },
});

export const SectorTile = memo(SectorTileBase);
export default SectorTile;
