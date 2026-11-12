import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { Flame, Radio, Zap } from 'lucide-react-native';
import theme from '../constants/theme';
import { SPRING_UI } from '../constants/config';
import type { LoseReason, Outcome } from '../game/types';

const SIZE = 120;

interface Props {
  outcome: Outcome;
  reason: LoseReason | 'stabilized';
}

function headline(outcome: Outcome, reason: Props['reason']) {
  if (outcome === 'win') {
    return { text: 'SECTOR STABILIZED', color: theme.colors.powered, Icon: Radio, size: 26 };
  }
  if (reason === 'flare') {
    return { text: 'FLARE SURGE', color: theme.colors.warning, Icon: Flame, size: 26 };
  }
  return { text: 'RELAY GRID COLLAPSED', color: theme.colors.warning, Icon: Zap, size: 23 };
}

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(
      (cx + r * Math.cos(a)).toFixed(2) + ',' + (cy + r * Math.sin(a)).toFixed(2),
    );
  }
  return pts.join(' ');
}

function ResultBadgeBase({ outcome, reason }: Props) {
  const spec = headline(outcome, reason);
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    enter.setValue(0);
    Animated.spring(enter, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_UI,
    }).start();
  }, [enter, outcome, reason]);

  const scale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  return (
    <View style={styles.root}>
      <Animated.View
        pointerEvents="none"
        style={[styles.hexWrap, { transform: [{ scale }], opacity: enter }]}
      >
        <Svg width={SIZE} height={SIZE}>
          <Polygon
            points={hexPoints(SIZE / 2, SIZE / 2, SIZE / 2 - 4)}
            fill={spec.color + '1F'}
            stroke={spec.color}
            strokeWidth={1.6}
          />
        </Svg>
        <View style={styles.hexIcon}>
          <spec.Icon size={44} color={spec.color} strokeWidth={2} />
        </View>
      </Animated.View>
      {/* The heading sits clear of the badge — no decor crosses the letters. */}
      <Text style={[styles.title, { color: spec.color, fontSize: spec.size }]}>
        {spec.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center' },
  hexWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  hexIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 18,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
});

export const ResultBadge = memo(ResultBadgeBase);
export default ResultBadge;
