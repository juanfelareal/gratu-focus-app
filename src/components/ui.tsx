import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { fonts } from '../theme';
import { useTheme } from '../store';

/** Micro-etiqueta monospace uppercase. */
export function MonoLabel({
  children,
  color,
  size = 10.5,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  const t = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: fonts.mono,
          fontSize: size,
          letterSpacing: 2.4,
          textTransform: 'uppercase',
          color: color ?? t.muted,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Botón pill principal (verde oscuro / crema en modo enfoque). */
export function Pill({
  label,
  onPress,
  disabled,
  loading,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: t.pillBg,
          opacity: disabled ? 0.35 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={t.pillText} />
      ) : (
        <Text style={[styles.pillLabel, { color: t.pillText }]}>{label}</Text>
      )}
    </Pressable>
  );
}

/** Botón pill secundario (glass con borde). */
export function PillGhost({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: t.glass,
          borderWidth: 1.5,
          borderColor: t.line,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      <Text style={[styles.pillLabel, { color: t.text }]}>{label}</Text>
    </Pressable>
  );
}

/** Card translúcida con borde suave. */
export function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.glass, borderColor: t.glassBorder },
        !t.isDark && styles.cardShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 100,
  },
  pillLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15.5,
    letterSpacing: -0.1,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
  },
  cardShadow: {
    shadowColor: '#15211B',
    shadowOpacity: 0.07,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
});
