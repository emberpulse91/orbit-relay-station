import React, { memo } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { buttonRect } from '../assets';
import { HIT_SLOP } from '../constants/config';
import theme from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import type { IconComponent } from './RoundIconButton';

export type ButtonTone = 'primary' | 'success' | 'violet';

const TONES: Record<ButtonTone, { colors: string[]; shadow: string; border: string }> = {
  primary: {
    colors: [theme.colors.primary, theme.colors.primaryDeep],
    shadow: theme.colors.primary,
    border: 'rgba(91,233,255,0.35)',
  },
  success: {
    colors: ['#2FBF86', '#17795A'],
    shadow: theme.colors.powered,
    border: 'rgba(70,232,166,0.38)',
  },
  violet: {
    colors: [theme.colors.secondary, '#4A1C78'],
    shadow: theme.colors.secondary,
    border: 'rgba(123,47,190,0.45)',
  },
};

interface Props {
  label: string;
  onPress: () => void;
  Icon?: IconComponent;
  tone?: ButtonTone;
  disabled?: boolean;
  height?: number;
}

/**
 * Icon and label sit in one centred row: the icon box is exactly 24x24, the
 * label lineHeight is 24 and the gap is 10 — identical on every button.
 */
function PrimaryButtonBase({
  label,
  onPress,
  Icon,
  tone = 'primary',
  disabled = false,
  height = 60,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  const spec = TONES[tone];

  return (
    <Pressable
      style={[styles.pressable, { height }, disabled ? styles.disabled : null]}
      hitSlop={HIT_SLOP}
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.shell,
          { height, shadowColor: spec.shadow },
          { transform: [{ scale }] },
        ]}
      >
        <LinearGradient
          colors={spec.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.plate, { height, borderColor: spec.border }]}
        >
          {/* The Codex plate sits ON TOP of the gradient so its bevel reads. */}
          <Image
            source={buttonRect}
            resizeMode="stretch"
            style={styles.plateImage}
          />
          <View style={styles.row}>
            {Icon ? (
              <View style={styles.iconBox}>
                <Icon size={24} color={theme.colors.textOnPrimary} strokeWidth={2.2} />
              </View>
            ) : null}
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: '100%' },
  disabled: { opacity: 0.45 },
  shell: {
    width: '100%',
    borderRadius: theme.radius.tile,
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  plate: {
    width: '100%',
    borderRadius: theme.radius.tile,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    opacity: 0.55,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: theme.colors.textOnPrimary,
  },
});

export const PrimaryButton = memo(PrimaryButtonBase);
export default PrimaryButton;
