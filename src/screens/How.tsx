import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard, MonoLabel, Pill } from '../components/ui';
import type { Nav } from '../nav';
import { fonts, palette } from '../theme';

const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: '01',
    title: 'Toca tu tag con el celular',
    body: 'Pégalo en tu escritorio, tu nevera o tu mesa de noche.',
  },
  {
    n: '02',
    title: 'Tus apps se bloquean',
    body: 'Instagram, TikTok y lo que tú elijas quedan detrás de un muro.',
  },
  {
    n: '03',
    title: 'Vuelve a tocarlo para liberar',
    body: 'Sin el tag físico no hay salida. La distancia hace el trabajo.',
  },
];

export function HowScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <SafeAreaView style={styles.root}>
      <View style={{ flex: 1, paddingTop: 34 }}>
        <MonoLabel>Cómo funciona</MonoLabel>
        <Text style={styles.h2}>Un toque y las distracciones desaparecen.</Text>
        <View style={{ gap: 12, marginTop: 30 }}>
          {STEPS.map((s) => (
            <GlassCard key={s.n} style={styles.step}>
              <MonoLabel size={11} color={palette.faint}>
                {s.n}
              </MonoLabel>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepBody}>{s.body}</Text>
              </View>
            </GlassCard>
          ))}
        </View>
      </View>
      <Pill label="Continuar" onPress={() => navigation.navigate('Permissions')} style={{ marginBottom: 18 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream, paddingHorizontal: 28 },
  h2: {
    fontFamily: fonts.semibold,
    fontSize: 27,
    letterSpacing: -0.8,
    lineHeight: 32,
    color: palette.ink,
    marginTop: 14,
  },
  step: { flexDirection: 'row', gap: 16, padding: 20, alignItems: 'flex-start' },
  stepTitle: { fontFamily: fonts.semibold, fontSize: 16, letterSpacing: -0.3, color: palette.ink },
  stepBody: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, color: palette.muted, marginTop: 5 },
});
