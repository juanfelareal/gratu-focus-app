import { CommonActions, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTagScan } from '../components/NfcOverlay';
import { Orb } from '../components/Orb';
import { MonoLabel, PillGhost } from '../components/ui';
import type { Nav, RootStackParamList } from '../nav';
import { nfcAvailable } from '../nfc';
import { useStore } from '../store';
import { fonts, palette } from '../theme';

export function PairTagScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'PairTag'>>();
  const mode = route.params?.mode ?? 'onboarding';
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const setTagId = useStore((s) => s.setTagId);
  const { overlay, scan } = useTagScan();

  const onScan = () =>
    scan({
      doneLabel: 'Tag vinculado',
      simulate: !nfcAvailable,
      writeToggleUrl: true,
      onSuccess: (tagId) => {
        if (mode === 'relink') {
          setTagId(tagId);
          navigation.goBack();
        } else {
          completeOnboarding(tagId);
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }),
          );
        }
      },
    });

  return (
    <SafeAreaView style={styles.root}>
      <View style={{ paddingTop: 34 }}>
        <MonoLabel>Tu tag</MonoLabel>
        <Text style={styles.h2}>Acerca tu tag Gratu al teléfono.</Text>
        <Text style={styles.body}>
          Vamos a vincularlo. Solo este tag podrá activar y desactivar tu modo enfoque.
        </Text>
      </View>
      <View style={styles.stage}>
        <Orb size={150} triRatio={0.37} />
      </View>
      <View style={{ marginBottom: 18 }}>
        <PillGhost
          label={nfcAvailable ? '◉  Escanear mi tag' : '◉  Simular toque del tag'}
          onPress={onScan}
        />
        <MonoLabel size={9.5} color={palette.faint} style={{ textAlign: 'center', marginTop: 14 }}>
          {nfcAvailable
            ? 'Mantén el tag contra la parte trasera del celular'
            : 'Sin NFC en este dispositivo — modo simulación'}
        </MonoLabel>
      </View>
      {overlay}
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
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
});
