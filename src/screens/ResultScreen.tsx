import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Star, Zap } from 'lucide-react-native';
import { HIT_SLOP, TOTAL_SECTORS } from '../constants/config';
import theme from '../constants/theme';
import type { RoundStats } from '../game/types';
import PrimaryButton from '../components/PrimaryButton';
import ResultBadge from '../components/ResultBadge';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import StarfieldBackdrop from '../components/StarfieldBackdrop';
import StatCard, { StatRow } from '../components/StatCard';

interface Props {
  stats: RoundStats;
  onPlayAgain: () => void;
  onNextSector: () => void;
  onMenu: () => void;
  onOpenProgress: () => void;
  onOpenCollection: () => void;
}

export default function ResultScreen({
  stats,
  onPlayAgain,
  onNextSector,
  onMenu,
  onOpenProgress,
  onOpenCollection,
}: Props) {
  const win = stats.outcome === 'win';
  const hasNext = win && stats.level + 1 < TOTAL_SECTORS;

  const starAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (!win) {
      return;
    }
    Animated.stagger(
      90,
      starAnims.map((v, i) =>
        Animated.spring(v, {
          toValue: i < stats.stars ? 1 : 0,
          useNativeDriver: true,
          tension: 180,
          friction: 8,
        }),
      ),
    ).start();
  }, [win, stats.stars, starAnims]);

  const handleNext = useCallback(() => onNextSector(), [onNextSector]);

  const subtitle = win
    ? 'ALL DOMES LIT'
    : stats.domesLit + '/' + stats.domesTotal + ' DOMES LIT';

  return (
    <StarfieldBackdrop variant={win ? 'win' : 'lose'}>
      <ScreenHeader
        title={'SECTOR ' + String(stats.level + 1).padStart(2, '0')}
        subtitle={subtitle}
        bordered={false}
      />

      <View style={styles.body}>
        <ResultBadge outcome={stats.outcome} reason={stats.reason} />

        {win ? (
          <View style={styles.starRow}>
            {starAnims.map((v, i) => (
              <Animated.View
                key={'star' + i}
                pointerEvents="none"
                style={{
                  transform: [
                    {
                      scale: v.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.75, 1],
                      }),
                    },
                  ],
                }}
              >
                <Star
                  size={34}
                  color={i < stats.stars ? theme.colors.star : theme.colors.locked}
                  fill={i < stats.stars ? theme.colors.star : 'transparent'}
                  strokeWidth={2}
                />
              </Animated.View>
            ))}
          </View>
        ) : null}

        <View style={styles.stats}>
          <StatRow>
            <StatCard
              value={stats.energyLeft}
              label="ENERGY LEFT"
              accent={theme.colors.beam}
              Icon={Zap}
            />
            <StatCard
              value={stats.relaysUsed}
              label="RELAYS USED"
              accent={theme.colors.primary}
              Icon={Zap}
            />
            <StatCard
              value={stats.score}
              label="SCORE"
              accent={theme.colors.star}
              Icon={Zap}
            />
          </StatRow>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="PLAY AGAIN" onPress={onPlayAgain} />
        {hasNext ? (
          <PrimaryButton label="NEXT SECTOR" onPress={handleNext} tone="success" />
        ) : null}
        {win && !hasNext ? (
          <PrimaryButton label="LEVEL SELECT" onPress={handleNext} tone="success" />
        ) : null}
        <SecondaryButton label="MENU" onPress={onMenu} />

        <View style={styles.routes}>
          <Pressable
            style={styles.route}
            hitSlop={HIT_SLOP}
            onPress={onOpenProgress}
            accessibilityRole="button"
            accessibilityLabel="Open progress"
          >
            <Text style={styles.routeText}>PROGRESS</Text>
          </Pressable>
          <Pressable
            style={styles.route}
            hitSlop={HIT_SLOP}
            onPress={onOpenCollection}
            accessibilityRole="button"
            accessibilityLabel="Open collection"
          >
            <Text style={styles.routeText}>COLLECTION</Text>
          </Pressable>
        </View>
      </View>
    </StarfieldBackdrop>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  starRow: { flexDirection: 'row', gap: 14, marginTop: 20 },
  stats: { width: '100%', marginTop: 26 },
  actions: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  routes: { flexDirection: 'row', gap: 12 },
  route: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  routeText: {
    fontSize: 11,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: theme.colors.textSecondary,
  },
});
