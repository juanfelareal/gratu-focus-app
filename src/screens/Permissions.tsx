import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { blocker, isDemoMode } from '../blocking';
import { Tri } from '../components/Tri';
import { GlassCard, MonoLabel, Pill } from '../components/ui';
import type { Nav } from '../nav';
import { fonts, palette } from '../theme';

export function PermissionsScreen() {
  const navigation = useNavigation<Nav>();
  const [hint, setHint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isIos = Platform.OS === 'ios';

  const next = () => navigation.navigate('SelectApps', { mode: 'onboarding' });

  const onAllow = async () => {
    setBusy(true);
    try {
      if (isDemoMode) {
        next();
        return;
      }
      await blocker.requestPermission();
      if (await blocker.hasPermission()) {
        next();
      } else {
        // Android abre Ajustes del sistema; el usuario vuelve y reintenta.
        setHint('Activa el permiso en Ajustes y vuelve a tocar el botón.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={{ flex: 1, paddingTop: 34 }}>
        <MonoLabel>Permisos</MonoLabel>
        <Text style={styles.h2}>Necesitamos un permiso del sistema.</Text>
        <Text style={styles.body}>
          Sin esto no podemos bloquear nada. Es un permiso oficial, controlado por tu celular — no
          por nosotros.
        </Text>
        <GlassCard style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Tri size={15} color={palette.green500} />
            <Text style={styles.cardTitle}>
              {isIos ? 'Tiempo en pantalla (Apple)' : 'Acceso de uso + sobre otras apps'}
            </Text>
          </View>
          <Text style={styles.cardBody}>
            {isIos
              ? 'Gratu Focus usa Screen Time de Apple para poner el muro sobre tus apps. Apple controla el bloqueo; nosotros nunca vemos qué haces en tu celular.'
              : 'Gratu Focus detecta cuándo abres una app bloqueada y pone el muro encima. Todo pasa en tu celular; nada sale de él.'}
          </Text>
        </GlassCard>
        {hint && <Text style={styles.hint}>{hint}</Text>}
        {isDemoMode && (
          <MonoLabel size={9.5} color={palette.faint} style={{ marginTop: 16, textAlign: 'center' }}>
            Modo demo — sin módulos nativos en este build
          </MonoLabel>
        )}
      </View>
      <View style={{ marginBottom: 18 }}>
        <Pill label="Permitir y continuar" onPress={onAllow} loading={busy} />
      </View>
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
  body: { fontFamily: fonts.regular, fontSize: 14.5, lineHeight: 24, color: palette.muted, marginTop: 14 },
  card: { padding: 24, marginTop: 30 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 7 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 15, color: palette.ink },
  cardBody: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 22, color: palette.muted },
  hint: {
    fontFamily: fonts.medium,
    fontSize: 13.5,
    color: palette.green700,
    marginTop: 18,
    textAlign: 'center',
  },
});
