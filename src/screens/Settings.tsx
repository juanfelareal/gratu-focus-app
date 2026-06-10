import { CommonActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { isDemoMode } from '../blocking';
import { GlassCard, MonoLabel } from '../components/ui';
import type { Nav } from '../nav';
import { useStore, useTheme } from '../store';
import { fonts, palette } from '../theme';

function Row({
  title,
  subtitle,
  right,
  onPress,
  last,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const t = useTheme();
  const content = (
    <View
      style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: t.line }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: t.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.rowSub, { color: t.muted }]}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
      {content}
    </Pressable>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.toggle,
        { backgroundColor: on ? (t.isDark ? palette.green300 : palette.green700) : t.line },
      ]}
    >
      <View style={[styles.knob, { transform: [{ translateX: on ? 19 : 0 }] }]} />
    </Pressable>
  );
}

export function SettingsScreen() {
  const t = useTheme();
  const navigation = useNavigation<Nav>();
  const strict = useStore((s) => s.strict);
  const setStrict = useStore((s) => s.setStrict);
  const emergencyLeft = useStore((s) => s.emergencyLeft);
  const blockedPackages = useStore((s) => s.blockedPackages);
  const hasIosSelection = useStore((s) => s.hasIosSelection);
  const tagId = useStore((s) => s.tagId);
  const resetAll = useStore((s) => s.resetAll);

  const appsLabel =
    Platform.OS === 'ios' && hasIosSelection
      ? 'Selección de Apple'
      : String(blockedPackages.length);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: t.bg }]}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: 16 }}>
        <MonoLabel>Ajustes</MonoLabel>
        <Text style={[styles.h2, { color: t.text }]}>Tu configuración</Text>
      </View>

      <GlassCard style={styles.card}>
        <Row
          title="Apps bloqueadas"
          right={<MonoLabel size={11}>{appsLabel} →</MonoLabel>}
          onPress={() => navigation.navigate('SelectApps', { mode: 'settings' })}
        />
        <Row
          title="Modo estricto"
          subtitle="Sin el tag físico no hay desbloqueo. Solo quedan tus emergencias."
          right={<Toggle on={strict} onToggle={() => setStrict(!strict)} />}
        />
        <Row
          title="Mi tag"
          subtitle={tagId ? `Vinculado · ${tagId.slice(0, 8)}` : 'Sin vincular'}
          right={<MonoLabel size={11}>re-vincular →</MonoLabel>}
          onPress={() => navigation.navigate('PairTag', { mode: 'relink' })}
        />
        <Row
          title="Desbloqueos de emergencia"
          subtitle="De por vida. Úsalos sabiamente."
          right={<MonoLabel size={11}>{emergencyLeft} de 5</MonoLabel>}
        />
        <Row
          title="Reiniciar app"
          subtitle="Borra tu configuración y empieza de cero."
          right={<MonoLabel size={11}>↺</MonoLabel>}
          onPress={() => {
            resetAll();
            navigation.dispatch(
              CommonActions.reset({ index: 0, routes: [{ name: 'Welcome' }] }),
            );
          }}
          last
        />
      </GlassCard>

      <MonoLabel size={9.5} color={t.faint} style={{ textAlign: 'center', marginTop: 34 }}>
        Gratu Focus · v0.1.0{isDemoMode ? ' · modo demo' : ''}
      </MonoLabel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 28 },
  h2: { fontFamily: fonts.semibold, fontSize: 27, letterSpacing: -0.8, marginTop: 14 },
  card: { marginTop: 26, paddingHorizontal: 20, paddingVertical: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 17,
  },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 15, letterSpacing: -0.2 },
  rowSub: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 3 },
  toggle: {
    width: 48,
    height: 29,
    borderRadius: 100,
    padding: 3,
    justifyContent: 'center',
  },
  knob: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
