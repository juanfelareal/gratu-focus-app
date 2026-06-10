import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard, MonoLabel } from '../components/ui';
import { fmtMin, sessionMinutes, useStore, useTheme } from '../store';
import { fonts } from '../theme';

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function StatsScreen() {
  const t = useTheme();
  const recoveredMin = useStore((s) => s.recoveredMin);
  const focusStartedAt = useStore((s) => s.focusStartedAt);
  const streak = useStore((s) => s.streak);

  const total = recoveredMin + sessionMinutes(focusStartedAt);
  const hours = total / 60;
  const todayIdx = (new Date().getDay() + 6) % 7; // lunes = 0

  // MVP: aún no hay historial por día — la barra de hoy lleva el total.
  const values = DAY_LABELS.map((_, i) => (i === todayIdx ? Math.max(total, 8) : 0));
  const max = Math.max(...values, 60);

  const equivalences: string[] = [
    `${Math.max(1, Math.round(hours * 0.6))} capítulos de un libro`,
    `${Math.max(1, Math.round(hours / 1.2))} entrenamientos completos`,
    `${Math.max(1, Math.round(hours * 2))} conversaciones de verdad`,
  ];

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <MonoLabel>Tiempo recuperado</MonoLabel>
      <Text style={[styles.hero, { color: t.accent }]}>{fmtMin(total)}</Text>
      <Text style={[styles.caption, { color: t.muted }]}>
        lejos de las distracciones
      </Text>

      <GlassCard style={styles.equivCard}>
        {equivalences.map((e, idx) => (
          <View
            key={e}
            style={[
              styles.equivRow,
              idx < equivalences.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.line },
            ]}
          >
            <Text style={[styles.eq, { color: t.accent }]}>=</Text>
            <Text style={[styles.equivText, { color: t.text }]}>{e}</Text>
          </View>
        ))}
      </GlassCard>

      <GlassCard style={styles.chartCard}>
        <View style={styles.chart}>
          {values.map((v, i) => (
            <View key={DAY_LABELS[i]} style={styles.barWrap}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max(6, Math.round((v / max) * 100))}%`,
                    backgroundColor: i === todayIdx ? t.accent : t.line,
                  },
                ]}
              />
              <MonoLabel size={9} color={t.faint}>
                {DAY_LABELS[i]}
              </MonoLabel>
            </View>
          ))}
        </View>
      </GlassCard>

      <Text style={[styles.streak, { color: t.muted }]}>
        Racha actual:{' '}
        <Text style={{ fontFamily: fonts.semibold, color: t.text }}>
          {streak} {streak === 1 ? 'día' : 'días'}
        </Text>{' '}
        enfocándote
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 28, paddingTop: 16 },
  hero: {
    fontFamily: fonts.light,
    fontSize: 60,
    letterSpacing: -2.8,
    lineHeight: 64,
    marginTop: 22,
    fontVariant: ['tabular-nums'],
  },
  caption: { fontFamily: fonts.regular, fontSize: 13.5, marginTop: 8 },
  equivCard: { marginTop: 26, paddingHorizontal: 20, paddingVertical: 8 },
  equivRow: { flexDirection: 'row', alignItems: 'baseline', gap: 14, paddingVertical: 13 },
  eq: { fontFamily: fonts.mono, fontSize: 12 },
  equivText: { fontFamily: fonts.medium, fontSize: 14.5 },
  chartCard: { marginTop: 18, paddingHorizontal: 20, paddingVertical: 22 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 110 },
  barWrap: { flex: 1, alignItems: 'center', gap: 9, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', maxWidth: 26, borderRadius: 100 },
  streak: { fontFamily: fonts.regular, fontSize: 14, textAlign: 'center', marginTop: 22 },
});
