import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { HIT_SLOP } from '../constants/config';
import theme from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import type { IconComponent } from './RoundIconButton';

interface Props {
  title: string;
  caption?: string;
  Icon?: IconComponent;
  accent?: string;
  onPress: () => void;
  style?: ViewStyle;
  /** The large hero tile of the bento grid. */
  hero?: boolean;
  heroSprite?: ImageSourcePropType;
}

function BentoTileBase({
  title,
  caption,
  Icon,
  accent = theme.colors.beam,
  onPress,
  style,
  hero = false,
  heroSprite,
}: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(hero ? 0.96 : 0.94);
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hero) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob, hero]);

  const floatY = bob.interpolate({ inputRange: [0, 1], outputRange: [-5, 5] });

  if (hero) {
    return (
      <Pressable
        style={[styles.heroPressable, style]}
        hitSlop={HIT_SLOP}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <Animated.View
          pointerEvents="box-none"
          style={[styles.heroShell, { transform: [{ scale }] }]}
        >
          {/* No stretched plate here: a 250x80 frame pulled to a tall tile
              would smear its bevel, so the hero uses gradient + border. */}
          <LinearGradient
            colors={theme.gradients.primaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroPlate}
          >
            {heroSprite ? (
              <Animated.View
                pointerEvents="none"
                style={{ transform: [{ translateY: floatY }] }}
              >
                <Image source={heroSprite} style={styles.heroSprite} resizeMode="contain" />
              </Animated.View>
            ) : null}
            <Text style={styles.heroTitle} numberOfLines={1}>
              {title}
            </Text>
            {caption ? (
              <Text style={styles.heroCaption} numberOfLines={1}>
                {caption}
              </Text>
            ) : null}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.pressable, style]}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[styles.shell, { transform: [{ scale }] }]}
      >
        <View style={[styles.iconWrap, { backgroundColor: accent + '22' }]}>
          {Icon ? <Icon size={22} color={accent} strokeWidth={2.1} /> : null}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {caption ? (
          <Text style={styles.caption} numberOfLines={1}>
            {caption}
          </Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: '100%', minHeight: 92 },
  shell: {
    width: '100%',
    minHeight: 92,
    flex: 1,
    borderRadius: theme.radius.tile,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.glass,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.textPrimary,
  },
  caption: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: theme.colors.textMuted,
  },

  heroPressable: { width: '100%', flex: 1, minHeight: 180 },
  heroShell: {
    width: '100%',
    flex: 1,
    borderRadius: theme.radius.big,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  heroPlate: {
    width: '100%',
    flex: 1,
    borderRadius: theme.radius.big,
    borderWidth: 1,
    borderColor: 'rgba(91,233,255,0.35)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  heroSprite: { width: 76, height: 76, marginBottom: 12 },
  heroTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: theme.colors.textOnPrimary,
    textAlign: 'center',
  },
  heroCaption: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: theme.colors.textSoft,
    textAlign: 'center',
  },
});

export const BentoTile = memo(BentoTileBase);
export default BentoTile;
