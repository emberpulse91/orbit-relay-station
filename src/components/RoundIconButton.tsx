import React, { memo } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { buttonRound } from '../assets';
import { HIT_SLOP } from '../constants/config';
import theme from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

export type { IconComponent } from './icon';
import type { IconComponent } from './icon';

interface Props {
  Icon?: IconComponent;
  source?: ImageSourcePropType;
  onPress: () => void;
  color?: string;
  accessibilityLabel: string;
}

function RoundIconButtonBase({
  Icon,
  source,
  onPress,
  color = theme.colors.textPrimary,
  accessibilityLabel,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);

  return (
    <Pressable
      style={styles.pressable}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[styles.shell, { transform: [{ scale }] }]}
      >
        <ImageBackground
          source={buttonRound}
          resizeMode="contain"
          style={styles.plate}
          imageStyle={styles.plateImage}
        >
          <View style={styles.iconBox}>
            {Icon ? <Icon size={22} color={color} strokeWidth={2} /> : null}
            {!Icon && source ? (
              <Image source={source} style={styles.glyph} resizeMode="contain" />
            ) : null}
          </View>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: 48, height: 48 },
  shell: { width: 48, height: 48 },
  // The round Codex plate IS the chrome here — no second border on top of it.
  plate: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateImage: { opacity: 0.95 },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { width: 22, height: 22 },
});

export const RoundIconButton = memo(RoundIconButtonBase);
export default RoundIconButton;
