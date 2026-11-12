import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { moduleSprites, reactorSprite } from '../assets';
import { CELL, SPRING_DEPLOY } from '../constants/config';
import theme from '../constants/theme';
import { MODULE_BY_ID } from '../game/modules';
import type { ModuleId } from '../game/types';

export type CellKind = 'empty' | 'asteroid' | 'reactor' | 'dome' | 'relay';

interface Props {
  col: number;
  row: number;
  kind: CellKind;
  moduleId?: ModuleId;
  powered: boolean;
  selected: boolean;
  rejected: boolean;
  warned: boolean;
  spin: number;
  justPlaced: boolean;
  label?: string;
  onPress: (col: number, row: number) => void;
}

const CELL_HIT = { top: 2, bottom: 2, left: 2, right: 2 };

function BoardCellBase({
  col,
  row,
  kind,
  moduleId,
  powered,
  selected,
  rejected,
  warned,
  spin,
  justPlaced,
  label,
  onPress,
}: Props) {
  const pop = useRef(new Animated.Value(justPlaced ? 0 : 1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!justPlaced) {
      return;
    }
    pop.setValue(0);
    Animated.spring(pop, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_DEPLOY,
    }).start();
  }, [justPlaced, pop, moduleId]);

  useEffect(() => {
    if (kind !== 'reactor' && !(kind === 'dome' && powered)) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 850,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [kind, powered, pulse]);

  const handlePress = React.useCallback(() => onPress(col, row), [col, row, onPress]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.06] });
  const popScale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });

  const inner = CELL - 4;
  const sprite = moduleId ? moduleSprites[MODULE_BY_ID[moduleId].index] : null;

  return (
    <Pressable
      style={[styles.cell, { width: CELL, height: CELL, left: col * CELL, top: row * CELL }]}
      hitSlop={CELL_HIT}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={'Cell ' + (col + 1) + '-' + (row + 1)}
    >
      <View
        style={[
          styles.inner,
          { width: inner, height: inner },
          selected ? styles.selected : null,
          rejected ? styles.rejected : null,
        ]}
      >
        {kind === 'empty' ? <View style={styles.dot} /> : null}

        {label ? <Text style={styles.coord}>{label}</Text> : null}

        {kind === 'asteroid' ? (
          <View
            pointerEvents="none"
            style={[
              styles.rockWrap,
              warned ? styles.rockWarned : null,
              { transform: [{ rotate: spin + 'deg' }] },
            ]}
          >
            <Svg width={inner} height={inner}>
              <Polygon
                points={rockPoints(inner)}
                fill="#2E3550"
                stroke="#5A6488"
                strokeWidth={1.2}
              />
              <Circle cx={inner * 0.38} cy={inner * 0.42} r={inner * 0.09} fill="#232942" />
              <Circle cx={inner * 0.62} cy={inner * 0.63} r={inner * 0.06} fill="#232942" />
            </Svg>
          </View>
        ) : null}

        {kind === 'reactor' ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.reactorWrap, { transform: [{ scale: pulseScale }] }]}
          >
            <Svg
              width={inner}
              height={inner}
              style={StyleSheet.absoluteFill}
            >
              <Polygon
                points={hexPoints(inner / 2, inner / 2, inner / 2 - 1)}
                fill="rgba(65,105,225,0.30)"
                stroke={theme.colors.beam}
                strokeWidth={1.4}
              />
            </Svg>
            <Image
              source={reactorSprite}
              style={{ width: inner - 6, height: inner - 6 }}
              resizeMode="contain"
            />
          </Animated.View>
        ) : null}

        {kind === 'dome' ? (
          <Animated.View
            pointerEvents="none"
            style={powered ? { transform: [{ scale: pulseScale }] } : undefined}
          >
            <Svg width={inner} height={inner}>
              <Polygon
                points={domePoints(inner)}
                fill={powered ? 'rgba(70,232,166,0.35)' : 'rgba(58,74,122,0.25)'}
                stroke={powered ? theme.colors.powered : theme.colors.inert}
                strokeWidth={1.6}
              />
              <Circle
                cx={inner / 2}
                cy={inner * 0.58}
                r={inner / 9}
                fill={powered ? theme.colors.powered : theme.colors.inert}
              />
            </Svg>
          </Animated.View>
        ) : null}

        {kind === 'relay' && sprite ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.relayWrap,
              { width: inner, height: inner, transform: [{ scale: popScale }] },
            ]}
          >
            <View
              style={[
                styles.relayRing,
                {
                  width: inner - 2,
                  height: inner - 2,
                  borderRadius: (inner - 2) / 2,
                  borderColor: powered ? theme.colors.beam : theme.colors.inert,
                },
              ]}
            />
            <Image
              source={sprite}
              style={{ width: inner - 8, height: inner - 8 }}
              resizeMode="contain"
            />
          </Animated.View>
        ) : null}
      </View>
    </Pressable>
  );
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

/** A chunky irregular rock — clearly not one of the satellite sprites. */
function rockPoints(size: number): string {
  const r = size / 2 - 1;
  const c = size / 2;
  const radii = [1, 0.82, 0.96, 0.78, 1, 0.86, 0.92];
  const pts: string[] = [];
  for (let i = 0; i < radii.length; i++) {
    const a = (2 * Math.PI * i) / radii.length - Math.PI / 2;
    pts.push(
      (c + r * radii[i] * Math.cos(a)).toFixed(2) +
        ',' +
        (c + r * radii[i] * Math.sin(a)).toFixed(2),
    );
  }
  return pts.join(' ');
}

function domePoints(size: number): string {
  const b = size * 0.82;
  const t = size * 0.22;
  const left = size * 0.12;
  const right = size * 0.88;
  const midL = size * 0.26;
  const midR = size * 0.74;
  return [
    left + ',' + b,
    midL + ',' + t,
    midR + ',' + t,
    right + ',' + b,
  ].join(' ');
}

const styles = StyleSheet.create({
  cell: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  selected: {
    borderWidth: 1.5,
    borderColor: theme.colors.beam,
    backgroundColor: 'rgba(65,105,225,0.22)',
  },
  rejected: {
    borderWidth: 1.5,
    borderColor: theme.colors.critical,
    backgroundColor: 'rgba(255,77,77,0.18)',
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(154,167,204,0.14)',
  },
  coord: {
    position: 'absolute',
    top: 1,
    left: 3,
    fontSize: 7,
    fontWeight: '600',
    color: 'rgba(154,167,204,0.45)',
  },
  rockWrap: { alignItems: 'center', justifyContent: 'center' },
  reactorWrap: { alignItems: 'center', justifyContent: 'center' },
  rockWarned: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,122,69,0.8)',
  },
  relayWrap: { alignItems: 'center', justifyContent: 'center' },
  relayRing: {
    position: 'absolute',
    borderWidth: 1,
    opacity: 0.8,
  },
});

export const BoardCell = memo(BoardCellBase);
export default BoardCell;
