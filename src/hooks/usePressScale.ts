import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { SPRING_PRESS } from '../constants/config';

/**
 * Press feedback the way this stack wants it: the Pressable stays the PARENT and
 * drives an Animated.View child through onPressIn/onPressOut. Only `transform`
 * is animated, so useNativeDriver stays true.
 */
export function usePressScale(to: number = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      ...SPRING_PRESS,
    }).start();
  }, [scale, to]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...SPRING_PRESS,
    }).start();
  }, [scale]);

  return { scale, onPressIn, onPressOut };
}

export default usePressScale;
