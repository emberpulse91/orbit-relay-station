import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Zap } from 'lucide-react-native';
import theme from '../constants/theme';

interface Props {
  energy: number;
  budget: number;
}

function EnergyMeterBase({ energy, budget }: Props) {
  const ratio = budget > 0 ? Math.max(0, Math.min(1, energy / budget)) : 0;
  const low = ratio < 0.25;

  // The bar animates its WIDTH, so this one must stay on the JS driver.
  const width = useRef(new Animated.Value(ratio)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prev = useRef(energy);

  useEffect(() => {
    Animated.timing(width, {
      toValue: ratio,
      duration: 320,
      useNativeDriver: false,
    }).start();
  }, [ratio, width]);

  useEffect(() => {
    if (prev.current === energy) {
      return;
    }
    prev.current = energy;
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.12, duration: 90, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();
  }, [energy, pulse]);

  const barWidth = width.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Zap size={18} color={theme.colors.beam} strokeWidth={2.2} />
        </View>
        <Text style={styles.label}>ENERGY</Text>
        <View style={styles.spacer} />
        <Animated.Text
          style={[
            styles.value,
            low ? styles.valueLow : null,
            { transform: [{ scale: pulse }] },
          ]}
        >
          {energy} / {budget}
        </Animated.Text>
      </View>
      <View style={styles.track}>
        <Animated.View pointerEvents="none" style={[styles.fillWrap, { width: barWidth }]}>
          <LinearGradient
            colors={low ? ['#FF7A45', '#FF4D4D'] : theme.gradients.beamBar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: 44, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBox: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  label: {
    fontSize: 10,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: theme.colors.textSecondary,
  },
  spacer: { flex: 1 },
  value: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: theme.colors.textPrimary,
  },
  valueLow: { color: theme.colors.warning },
  track: {
    marginTop: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fillWrap: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { flex: 1, borderRadius: 3 },
});

export const EnergyMeter = memo(EnergyMeterBase);
export default EnergyMeter;
