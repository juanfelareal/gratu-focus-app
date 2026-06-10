import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Tri } from './Tri';

/**
 * Orbe verde con el triángulo Gratu — la firma visual de la app.
 * Gradiente radial con borde difuminado (sin blur nativo).
 */
export function Orb({
  size = 168,
  triRatio = 0.38,
  breathe = true,
}: {
  size?: number;
  triRatio?: number;
  breathe?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!breathe) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 2100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 2100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe, scale]);

  return (
    <Animated.View style={[{ width: size, height: size }, styles.center, { transform: [{ scale }] }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="orb" cx="38%" cy="32%" r="68%">
            <Stop offset="0%" stopColor="#6FAE8A" stopOpacity="1" />
            <Stop offset="42%" stopColor="#2D6A4F" stopOpacity="1" />
            <Stop offset="74%" stopColor="#173A2A" stopOpacity="0.96" />
            <Stop offset="88%" stopColor="#0E2018" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#0E2018" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill="url(#orb)" />
      </Svg>
      <View style={styles.center}>
        <Tri size={size * triRatio} color="#F3F1EC" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
