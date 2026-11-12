import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';
import { logo } from '../assets';
import { LOADER_DURATION_MS, SPRING_UI } from '../constants/config';
import theme from '../constants/theme';
import StarfieldBackdrop from '../components/StarfieldBackdrop';

const RING = 180;
const BAR_W = 180;

interface Props {
  onDone: () => void;
}

export default function LoaderScreen({ onDone }: Props) {
  const logoIn = useRef(new Animated.Value(0)).current;
  const ringIn = useRef(new Animated.Value(0)).current;
  const titleIn = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const dots = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  // The hold is driven by the timer alone — never by an animation callback and
  // never by a tap.
  useEffect(() => {
    const handle = setTimeout(() => doneRef.current(), LOADER_DURATION_MS);
    return () => clearTimeout(handle);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoIn, { toValue: 1, useNativeDriver: true, tension: 48, friction: 7 }),
      Animated.sequence([
        Animated.delay(260),
        Animated.timing(ringIn, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(420),
        Animated.spring(titleIn, { toValue: 1, useNativeDriver: true, ...SPRING_UI }),
      ]),
    ]).start();

    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spinLoop.start();

    // Width cannot run on the native driver.
    const barAnim = Animated.timing(bar, {
      toValue: 1,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    barAnim.start();

    const dotLoop = Animated.loop(
      Animated.stagger(
        180,
        dots.map(d =>
          Animated.sequence([
            Animated.timing(d, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(d, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ]),
        ),
      ),
    );
    dotLoop.start();

    return () => {
      spinLoop.stop();
      barAnim.stop();
      dotLoop.stop();
    };
  }, [logoIn, ringIn, titleIn, spin, bar, dots]);

  const logoScale = logoIn.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const titleShift = titleIn.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const barWidth = bar.interpolate({ inputRange: [0, 1], outputRange: [0, BAR_W] });

  return (
    <StarfieldBackdrop variant="loader">
      <View style={styles.root}>
        <View style={styles.badge}>
          <Animated.View
            pointerEvents="none"
            style={[styles.ring, { opacity: ringIn, transform: [{ rotate }] }]}
          >
            <Svg width={RING} height={RING}>
              <Circle
                cx={RING / 2}
                cy={RING / 2}
                r={RING / 2 - 2}
                stroke={theme.colors.primary}
                strokeOpacity={0.4}
                strokeWidth={1.5}
                fill="none"
              />
              <Circle
                cx={RING / 2}
                cy={RING / 2}
                r={RING / 2 - 16}
                stroke={theme.colors.secondary}
                strokeOpacity={0.25}
                strokeWidth={1}
                fill="none"
              />
              <Line x1={RING / 2} y1={0} x2={RING / 2} y2={10} stroke={theme.colors.beam} strokeWidth={2} />
              <Line x1={RING / 2} y1={RING - 10} x2={RING / 2} y2={RING} stroke={theme.colors.beam} strokeWidth={2} />
              <Line x1={0} y1={RING / 2} x2={10} y2={RING / 2} stroke={theme.colors.beam} strokeWidth={2} />
              <Line x1={RING - 10} y1={RING / 2} x2={RING} y2={RING / 2} stroke={theme.colors.beam} strokeWidth={2} />
            </Svg>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={{ opacity: logoIn, transform: [{ scale: logoScale }] }}
          >
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </Animated.View>
        </View>

        <Animated.View
          pointerEvents="none"
          style={{ opacity: titleIn, transform: [{ translateY: titleShift }] }}
        >
          <Text style={styles.title}>ORBIT RELAY</Text>
          <Text style={styles.titleSub}>STATION</Text>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.track}>
            <Animated.View pointerEvents="none" style={[styles.fillWrap, { width: barWidth }]}>
              <LinearGradient
                colors={theme.gradients.progressBar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fill}
              />
            </Animated.View>
          </View>
          <View style={styles.loadingRow}>
            <Text style={styles.loading}>LOADING</Text>
            {dots.map((d, i) => (
              <Animated.View pointerEvents="none" key={'dot' + i} style={[styles.dot, { opacity: d }]} />
            ))}
          </View>
          <Text style={styles.subtitle}>CALIBRATING BEAM ARRAY</Text>
        </View>
      </View>
    </StarfieldBackdrop>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  badge: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: { position: 'absolute', width: RING, height: RING },
  logo: { width: 148, height: 148 },
  title: {
    marginTop: 24,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 5,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  titleSub: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 10,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  footer: { position: 'absolute', bottom: 72, alignItems: 'center' },
  track: {
    width: BAR_W,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  fillWrap: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { flex: 1, borderRadius: 2 },
  loadingRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: theme.colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.beam,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.4,
    color: theme.colors.textMuted,
  },
});
