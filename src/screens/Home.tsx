import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmergencyModal } from '../components/EmergencyModal';
import { useTagScan } from '../components/NfcOverlay';
import { Tri } from '../components/Tri';
import { GlassCard, MonoLabel } from '../components/ui';
import { emergencyUnlock, toggleFocus } from '../focus';
import { nfcAvailable } from '../nfc';
import { fmtMin, sessionMinutes, useStore, useTheme } from '../store';
import { fonts } from '../theme';

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function HomeScreen() {
  const t = useTheme();
  const focused = useStore((s) => s.focused);
  const focusStartedAt = useStore((s) => s.focusStartedAt);
  const emergencyLeft = useStore((s) => s.emergencyLeft);
  const blockedPackages = useStore((s) => s.blockedPackages);
  const hasIosSelection = useStore((s) => s.hasIosSelection);
  const tagId = useStore((s) => s.tagId);
  const { overlay, scan } = useTagScan();
  const [now, setNow] = useState(new Date());
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const dateLine = `${DAYS[now.getDay()]} · ${now.getDate()} ${MONTHS[now.getMonth()]}`;

  const onScanTag = () =>
    scan({
      doneLabel: 'Tag detectado',
      expectedTagId: tagId,
      simulate: !nfcAvailable || !tagId,
      onSuccess: () => {
        toggleFocus();
      },
    });

  const isIos = Platform.OS === 'ios';
  const listItems = isIos && hasIosSelection
    ? [{ label: 'Tu selección de Apple', packageName: '_ios' }]
    : blockedPackages;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <Tri size={17} color={t.text} />
          <MonoLabel size={9.5} color={t.text}>
            GRATU FOCUS
          </MonoLabel>
        </View>
        <View style={[styles.chip, { backgroundColor: t.glass, borderColor: t.glassBorder }]}>
          <View
            style={[
              styles.dot,
              { backgroundColor: focused ? t.accent : t.faint },
            ]}
          />
          <MonoLabel size={10} color={t.muted}>
            {focused ? 'ENFOCADO' : 'MODO LIBRE'}
          </MonoLabel>
        </View>
      </View>

      <Text style={[styles.clock, { color: t.text }]}>
        {hh}:{mm}
      </Text>
      <MonoLabel size={11} style={{ marginTop: 12 }}>
        {dateLine}
      </MonoLabel>
      {focused && (
        <Text style={[styles.counter, { color: t.accent }]}>
          {fmtMin(sessionMinutes(focusStartedAt))} protegidas
        </Text>
      )}

      <GlassCard style={styles.listCard}>
        <MonoLabel size={10} color={t.faint} style={{ marginBottom: 6 }}>
          {focused ? 'Bloqueadas ahora' : 'Tu lista de bloqueo'}
        </MonoLabel>
        {listItems.length === 0 ? (
          <Text style={[styles.emptyList, { color: t.muted }]}>
            Aún no eliges apps — ve a Ajustes.
          </Text>
        ) : (
          listItems.map((app, idx) => (
            <View
              key={app.packageName}
              style={[
                styles.listRow,
                idx < listItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.line },
              ]}
            >
              <Text style={[styles.listLabel, { color: t.text }]}>{app.label}</Text>
              <MonoLabel size={9.5} color={focused ? t.accent : t.faint}>
                {focused ? 'bloqueada' : 'se bloqueará'}
              </MonoLabel>
            </View>
          ))
        )}
      </GlassCard>

      <View style={styles.bottom}>
        <Pressable onPress={onScanTag} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
          <View style={[styles.scanBtn, { borderColor: t.faint, backgroundColor: t.glass }]}>
            <MonoLabel size={10} color={t.muted}>
              ◉ {nfcAvailable && tagId ? 'Escanear tag' : 'Simular tag'}
            </MonoLabel>
          </View>
        </Pressable>
        <View style={styles.hintRow}>
          <View style={[styles.hintLine, { backgroundColor: t.line }]} />
          <MonoLabel size={10.5}>
            {focused ? 'Toca tu tag para liberar' : 'Toca tu tag para enfocarte'}
          </MonoLabel>
          <View style={[styles.hintLine, { backgroundColor: t.line }]} />
        </View>
        {focused && (
          <Pressable onPress={() => setEmergencyOpen(true)}>
            <MonoLabel size={10} color={t.faint} style={{ paddingVertical: 10 }}>
              Emergencia · {emergencyLeft} restantes
            </MonoLabel>
          </Pressable>
        )}
      </View>

      <EmergencyModal
        visible={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        onConfirm={() => {
          setEmergencyOpen(false);
          emergencyUnlock();
        }}
      />
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 28, paddingTop: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 100,
    borderWidth: 1,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  clock: {
    fontFamily: fonts.light,
    fontSize: 78,
    letterSpacing: -3.5,
    lineHeight: 80,
    marginTop: 38,
    fontVariant: ['tabular-nums'],
  },
  counter: { fontFamily: fonts.medium, fontSize: 16, letterSpacing: -0.2, marginTop: 18 },
  listCard: { marginTop: 26, paddingHorizontal: 20, paddingVertical: 18 },
  emptyList: { fontFamily: fonts.regular, fontSize: 14, paddingVertical: 10 },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  listLabel: { fontFamily: fonts.medium, fontSize: 15, letterSpacing: -0.2 },
  bottom: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 96 },
  scanBtn: {
    paddingHorizontal: 17,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 18,
  },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hintLine: { width: 26, height: 1 },
});
