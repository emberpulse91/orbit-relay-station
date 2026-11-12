import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import theme from '../constants/theme';

interface Props {
  msLeft: number;
  total: number;
  armed: boolean;
}

const SIZE = 44;
const R = 18;
const CIRC = 2 * Math.PI * R;

function FlareTimerBase({ msLeft, total, armed }: Props) {
  const seconds = Math.max(0, Math.ceil(msLeft / 1000));
  const ratio = total > 0 ? Math.max(0, Math.min(1, msLeft / total)) : 0;
  const critical = seconds <= 15;
  const stroke = critical ? theme.colors.critical : theme.colors.warning;

  return (
    <View style={styles.root}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={3}
          fill="rgba(5,5,16,0.72)"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={stroke}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${CIRC}`}
          strokeDashoffset={CIRC * (1 - ratio)}
          opacity={armed ? 1 : 0.4}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.value, { color: stroke }]}>{seconds}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: SIZE, height: SIZE },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 13, lineHeight: 16, fontWeight: '800' },
});

export const FlareTimer = memo(FlareTimerBase);
export default FlareTimer;
