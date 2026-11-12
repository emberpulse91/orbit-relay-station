import React, { memo } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { HIT_SLOP } from '../constants/config';
import theme from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import type { IconComponent } from './RoundIconButton';

interface Props {
  label: string;
  onPress: () => void;
  Icon?: IconComponent;
  danger?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

function SecondaryButtonBase({
  label,
  onPress,
  Icon,
  danger = false,
  disabled = false,
  compact = false,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale();
  const tint = danger ? theme.colors.critical : theme.colors.textSoft;

  return (
    <Pressable
      style={[
        styles.pressable,
        compact ? styles.pressableCompact : null,
        disabled ? styles.disabled : null,
      ]}
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
          compact ? styles.shellCompact : null,
          danger ? styles.shellDanger : null,
          { transform: [{ scale }] },
        ]}
      >
        <View style={styles.row}>
          {Icon ? (
            <View style={styles.iconBox}>
              <Icon size={24} color={tint} strokeWidth={2.2} />
            </View>
          ) : null}
          <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: '100%', height: 48 },
  pressableCompact: { height: 48, width: undefined, flex: 1 },
  disabled: { opacity: 0.4 },
  shell: {
    width: '100%',
    height: 48,
    borderRadius: theme.radius.row,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shellCompact: { width: '100%' },
  shellDanger: { borderColor: 'rgba(255,77,77,0.55)' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
});

export const SecondaryButton = memo(SecondaryButtonBase);
export default SecondaryButton;
