import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { bgGame } from '../assets';
import { SCREEN_H, SCREEN_W } from '../constants/config';
import theme from '../constants/theme';
import { mulberry32 } from '../game/rng';

export type BackdropVariant =
  | 'loader'
  | 'menu'
  | 'levels'
  | 'game'
  | 'win'
  | 'lose'
  | 'panel';

type VariantSpec = {
  imageOpacity: number;
  colors: string[];
  locations: number[];
  start: { x: number; y: number };
  end: { x: number; y: number };
  stars: number;
};

const VARIANTS: Record<BackdropVariant, VariantSpec> = {
  // The loader is deliberately the darkest screen in the app.
  loader: {
    imageOpacity: 0.35,
    colors: ['rgba(5,5,16,0.97)', 'rgba(10,10,32,0.93)', 'rgba(5,5,16,0.99)'],
    locations: [0, 0.5, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    stars: 26,
  },
  menu: {
    imageOpacity: 0.55,
    colors: ['rgba(5,5,16,0.80)', 'rgba(16,16,58,0.60)', 'rgba(10,22,40,0.90)'],
    locations: [0, 0.55, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
    stars: 18,
  },
  levels: {
    imageOpacity: 0.4,
    colors: ['rgba(5,5,16,0.95)', 'rgba(10,22,40,0.80)'],
    locations: [0, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    stars: 14,
  },
  game: {
    imageOpacity: 0.3,
    colors: ['rgba(5,5,16,0.93)', 'rgba(10,22,40,0.86)', 'rgba(5,5,16,0.95)'],
    locations: [0, 0.5, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    stars: 10,
  },
  win: {
    imageOpacity: 0.3,
    colors: ['rgba(5,5,16,0.95)', 'rgba(12,42,40,0.90)', 'rgba(5,5,16,0.97)'],
    locations: [0, 0.5, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    stars: 20,
  },
  lose: {
    imageOpacity: 0.3,
    colors: ['rgba(5,5,16,0.95)', 'rgba(42,20,20,0.90)', 'rgba(5,5,16,0.97)'],
    locations: [0, 0.5, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
    stars: 20,
  },
  panel: {
    imageOpacity: 0.45,
    colors: ['rgba(10,10,32,0.95)', 'rgba(16,16,58,0.80)'],
    locations: [0, 1],
    start: { x: 0.1, y: 0 },
    end: { x: 0.9, y: 1 },
    stars: 16,
  },
};

type Star = { cx: number; cy: number; r: number; o: number };

function makeStars(count: number, seed: number): Star[] {
  const rng = mulberry32(seed);
  const out: Star[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      cx: Math.round(rng() * SCREEN_W),
      cy: Math.round(rng() * SCREEN_H),
      r: Math.round((0.8 + rng() * 1.0) * 10) / 10,
      o: Math.round((0.18 + rng() * 0.22) * 100) / 100,
    });
  }
  return out;
}

interface Props {
  variant: BackdropVariant;
  children?: React.ReactNode;
}

function StarfieldBackdropBase({ variant, children }: Props) {
  const spec = VARIANTS[variant];
  const stars = useMemo(() => makeStars(spec.stars, 909 + spec.stars), [spec.stars]);
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Parallax hint: only the star layer moves, and only on transform.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const translateY = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6],
  });

  return (
    <View style={styles.root}>
      <ImageBackground
        source={bgGame}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: spec.imageOpacity }}
      >
        <LinearGradient
          colors={spec.colors}
          locations={spec.locations}
          start={spec.start}
          end={spec.end}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { transform: [{ translateY }] }]}
        >
          <Svg width={SCREEN_W} height={SCREEN_H}>
            {stars.map((s, i) => (
              <Circle
                key={'star-' + i}
                cx={s.cx}
                cy={s.cy}
                r={s.r}
                fill={theme.colors.textSecondary}
                opacity={s.o}
              />
            ))}
          </Svg>
        </Animated.View>
      </ImageBackground>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  content: { flex: 1 },
});

export const StarfieldBackdrop = memo(StarfieldBackdropBase);
export default StarfieldBackdrop;
