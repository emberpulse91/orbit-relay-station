import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { BEAM_FLOW_MS, BOARD_FRAME, BOARD_H, BOARD_W, CELL } from '../constants/config';
import theme from '../constants/theme';
import type { Link, Point } from '../game/types';

const AnimatedLine = Animated.createAnimatedComponent(Line);

export function cx(col: number) {
  return BOARD_FRAME + col * CELL + CELL / 2;
}
export function cy(row: number) {
  return BOARD_FRAME + row * CELL + CELL / 2;
}

interface Props {
  links: Link[];
  highContrast: boolean;
  /** Reactor reach shown while the board is still empty. */
  previewFrom?: Point | null;
  previewRange?: number;
  showPreview: boolean;
  flash: boolean;
}

function BeamLayerBase({
  links,
  highContrast,
  previewFrom,
  previewRange = 0,
  showPreview,
  flash,
}: Props) {
  const flow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // strokeDashoffset is not a transform, so this one stays on the JS driver.
    const loop = Animated.loop(
      Animated.timing(flow, {
        toValue: 1,
        duration: BEAM_FLOW_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    flow.setValue(0);
    loop.start();
    return () => loop.stop();
  }, [flow]);

  const dashOffset = flow.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  const liveColor = flash
    ? '#FFFFFF'
    : highContrast
    ? '#FFC24D'
    : theme.colors.beam;
  const liveWidth = highContrast ? 3 : 2;

  return (
    <Svg
      width={BOARD_W}
      height={BOARD_H}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {showPreview && previewFrom && previewRange > 0 ? (
        <Circle
          cx={cx(previewFrom.col)}
          cy={cy(previewFrom.row)}
          r={previewRange * CELL}
          stroke={theme.colors.primary}
          strokeWidth={1}
          strokeDasharray="4 6"
          strokeOpacity={0.35}
          fill="none"
        />
      ) : null}

      {links.map((l, i) =>
        l.live ? null : (
          <Line
            key={'dead-' + i}
            x1={cx(l.ax)}
            y1={cy(l.ay)}
            x2={cx(l.bx)}
            y2={cy(l.by)}
            stroke={theme.colors.inert}
            strokeWidth={1}
            strokeDasharray="3 7"
            strokeOpacity={0.55}
          />
        ),
      )}

      {links.map((l, i) =>
        l.live ? (
          <Line
            key={'glow-' + i}
            x1={cx(l.ax)}
            y1={cy(l.ay)}
            x2={cx(l.bx)}
            y2={cy(l.by)}
            stroke={liveColor}
            strokeWidth={6}
            strokeOpacity={0.18}
            strokeLinecap="round"
          />
        ) : null,
      )}

      {links.map((l, i) =>
        l.live ? (
          <AnimatedLine
            key={'live-' + i}
            x1={cx(l.ax)}
            y1={cy(l.ay)}
            x2={cx(l.bx)}
            y2={cy(l.by)}
            stroke={liveColor}
            strokeWidth={liveWidth}
            strokeOpacity={0.95}
            strokeLinecap="round"
            strokeDasharray="6 10"
            strokeDashoffset={dashOffset as unknown as number}
          />
        ) : null,
      )}
    </Svg>
  );
}

export const BeamLayer = memo(BeamLayerBase);
export default BeamLayer;
