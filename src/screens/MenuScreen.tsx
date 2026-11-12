import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Activity, Box, Grid3x3, Info, Settings } from 'lucide-react-native';
import { logo, sprite1 } from '../assets';
import { SPRING_UI, TOTAL_SECTORS, TOTAL_STARS } from '../constants/config';
import theme from '../constants/theme';
import {
  bestScore,
  sectorsCleared as countCleared,
  nextSector,
  totalStars,
} from '../state/progressStore';
import { useProgress } from '../hooks/useProgress';
import BentoTile from '../components/BentoTile';
import PrimaryButton from '../components/PrimaryButton';
import RoundIconButton from '../components/RoundIconButton';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import StarfieldBackdrop from '../components/StarfieldBackdrop';

interface Props {
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenCollection: () => void;
  onOpenProgress: () => void;
  onOpenSettings: () => void;
}

const HOW_TO_STEPS = [
  'Pick a relay module, then tap open space to deploy it. Each module costs energy.',
  'Chain relays from the reactor to every colony dome. Beams cannot pass through rock.',
  'Light all domes before the energy ration or the flare window runs out.',
];

export default function MenuScreen({
  onPlay,
  onOpenLevels,
  onOpenCollection,
  onOpenProgress,
  onOpenSettings,
}: Props) {
  const progress = useProgress();
  const [howTo, setHowTo] = useState(false);

  const cleared = countCleared(progress);
  const stars = totalStars(progress);
  const best = bestScore(progress);
  const next = nextSector(progress);

  const hasLog = [cleared, stars, best].filter(v => v > 0).length >= 2;

  const stagger = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      70,
      stagger.map(v =>
        Animated.spring(v, { toValue: 1, useNativeDriver: true, ...SPRING_UI }),
      ),
    ).start();
  }, [stagger]);

  const enterStyle = useCallback(
    (i: number) => ({
      opacity: stagger[i],
      transform: [
        {
          translateY: stagger[i].interpolate({
            inputRange: [0, 1],
            outputRange: [18, 0],
          }),
        },
      ],
    }),
    [stagger],
  );

  const unlockedModules = useMemo(
    () => 1 + [3, 6, 9].filter(t => cleared >= t).length,
    [cleared],
  );

  const openHowTo = useCallback(() => setHowTo(true), []);
  const closeHowTo = useCallback(() => setHowTo(false), []);

  return (
    <StarfieldBackdrop variant="menu">
      <ScreenHeader
        title="ORBIT RELAY"
        subtitle="STATION"
        leftSlot={<Image source={logo} style={styles.brand} resizeMode="contain" />}
        rightSlot={
          <RoundIconButton
            Icon={Settings}
            onPress={onOpenSettings}
            accessibilityLabel="Open settings"
          />
        }
        bordered={false}
      />

      <View style={styles.body}>
        {hasLog ? (
          <View style={styles.strip}>
            <View style={styles.stripCell}>
              <Text style={styles.stripLabel}>SECTORS</Text>
              <Text style={styles.stripValue}>
                {cleared}/{TOTAL_SECTORS}
              </Text>
            </View>
            <View style={styles.stripDivider} />
            <View style={styles.stripCell}>
              <Text style={styles.stripLabel}>STARS</Text>
              <Text style={[styles.stripValue, { color: theme.colors.star }]}>
                {stars}/{TOTAL_STARS}
              </Text>
            </View>
            <View style={styles.stripDivider} />
            <View style={styles.stripCell}>
              <Text style={styles.stripLabel}>BEST</Text>
              <Text style={[styles.stripValue, { color: theme.colors.beam }]}>{best}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.strip}>
            <Text style={styles.stripEmpty}>
              NEW STATION LOG · NOTHING ROUTED YET
            </Text>
          </View>
        )}

        <View style={styles.grid}>
          <View style={styles.gridTop}>
            <Animated.View style={[styles.heroSlot, enterStyle(0)]} pointerEvents="box-none">
              <BentoTile
                hero
                heroSprite={sprite1}
                title="START MISSION"
                caption={'SECTOR ' + String(next + 1).padStart(2, '0') + ' · NEXT'}
                onPress={onPlay}
              />
            </Animated.View>

            <View style={styles.sideColumn}>
              <Animated.View style={[styles.sideSlot, enterStyle(1)]} pointerEvents="box-none">
                <BentoTile
                  title="LEVELS"
                  caption={TOTAL_SECTORS + ' SECTORS'}
                  Icon={Grid3x3}
                  accent={theme.colors.beam}
                  onPress={onOpenLevels}
                />
              </Animated.View>
              <Animated.View style={[styles.sideSlot, enterStyle(2)]} pointerEvents="box-none">
                <BentoTile
                  title="COLLECTION"
                  caption={unlockedModules + '/4 MODULES'}
                  Icon={Box}
                  accent={theme.colors.secondary}
                  onPress={onOpenCollection}
                />
              </Animated.View>
            </View>
          </View>

          <View style={styles.gridBottom}>
            <Animated.View style={[styles.bottomSlot, enterStyle(3)]} pointerEvents="box-none">
              <BentoTile
                title="PROGRESS"
                caption="STATION LOG"
                Icon={Activity}
                accent={theme.colors.powered}
                onPress={onOpenProgress}
              />
            </Animated.View>
            <Animated.View style={[styles.bottomSlot, enterStyle(4)]} pointerEvents="box-none">
              <BentoTile
                title="HOW TO PLAY"
                caption="3 STEPS"
                Icon={Info}
                accent={theme.colors.textSecondary}
                onPress={openHowTo}
              />
            </Animated.View>
          </View>
        </View>

        {/* Text route so every screen is one tap from Menu by its own name. */}
        <View style={styles.routeRow}>
          <SecondaryButton label="SETTINGS" onPress={onOpenSettings} />
        </View>
      </View>

      {howTo ? (
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>HOW TO PLAY</Text>
            {HOW_TO_STEPS.map((step, i) => (
              <View style={styles.step} key={'step' + i}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            <View style={styles.sheetAction}>
              <PrimaryButton label="CLOSE" onPress={closeHowTo} height={56} />
            </View>
          </View>
        </View>
      ) : null}
    </StarfieldBackdrop>
  );
}

const styles = StyleSheet.create({
  brand: { width: 40, height: 40 },
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 20 },

  strip: {
    height: 54,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.row,
    borderWidth: 1,
    borderColor: theme.colors.borderAccent,
    backgroundColor: 'rgba(16,16,58,0.55)',
    paddingHorizontal: 12,
  },
  stripCell: { flex: 1, alignItems: 'center' },
  stripDivider: { width: 1, height: 26, backgroundColor: 'rgba(255,255,255,0.10)' },
  stripLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: theme.colors.textMuted,
  },
  stripValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.textPrimary,
  },
  stripEmpty: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  grid: { flex: 1, marginTop: 12, gap: 12 },
  gridTop: { flex: 1, flexDirection: 'row', gap: 12 },
  heroSlot: { flex: 62 },
  sideColumn: { flex: 38, gap: 12 },
  sideSlot: { flex: 1 },
  gridBottom: { height: 92, flexDirection: 'row', gap: 12 },
  routeRow: { marginTop: 12 },
  bottomSlot: { flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,16,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 30,
  },
  sheet: {
    width: '100%',
    borderRadius: theme.radius.big,
    borderWidth: 1,
    borderColor: theme.colors.borderAccent,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2.4,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 18,
  },
  step: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(65,105,225,0.25)',
  },
  stepNumber: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    color: theme.colors.beam,
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    color: theme.colors.textSoft,
  },
  sheetAction: { marginTop: 6 },
});
