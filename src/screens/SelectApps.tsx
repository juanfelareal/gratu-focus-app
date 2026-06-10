import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isDemoMode } from '../blocking';
import { getInstalledApps } from '../blocking/android';
import { getDeviceActivity, SELECTION_ID } from '../blocking/ios';
import { GlassCard, MonoLabel, Pill } from '../components/ui';
import type { Nav, RootStackParamList } from '../nav';
import { AndroidApp, useStore } from '../store';
import { fonts, palette } from '../theme';

/** Apps de demo cuando no hay módulos nativos (Expo Go). */
const DEMO_APPS: AndroidApp[] = [
  { label: 'Instagram', packageName: 'com.instagram.android' },
  { label: 'TikTok', packageName: 'com.zhiliaoapp.musically' },
  { label: 'YouTube', packageName: 'com.google.android.youtube' },
  { label: 'X (Twitter)', packageName: 'com.twitter.android' },
  { label: 'Facebook', packageName: 'com.facebook.katana' },
  { label: 'WhatsApp', packageName: 'com.whatsapp' },
  { label: 'Netflix', packageName: 'com.netflix.mediaclient' },
  { label: 'Pinterest', packageName: 'com.pinterest' },
];

const WHATSAPP_WARNING =
  'Ojo: no recibirás mensajes ni llamadas de WhatsApp mientras estés enfocado.';

export function SelectAppsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<RootStackParamList, 'SelectApps'>>();
  const mode = route.params?.mode ?? 'onboarding';

  const blockedPackages = useStore((s) => s.blockedPackages);
  const setBlockedPackages = useStore((s) => s.setBlockedPackages);
  const setHasIosSelection = useStore((s) => s.setHasIosSelection);

  const [apps, setApps] = useState<AndroidApp[]>(DEMO_APPS);
  const isIosNative = Platform.OS === 'ios' && !isDemoMode;

  useEffect(() => {
    if (Platform.OS === 'android' && !isDemoMode) {
      getInstalledApps().then((list) => {
        if (list.length > 0) setApps(list);
      });
    }
  }, []);

  const selected = useMemo(
    () => new Set(blockedPackages.map((a) => a.packageName)),
    [blockedPackages],
  );

  const toggle = (app: AndroidApp) => {
    if (selected.has(app.packageName)) {
      setBlockedPackages(blockedPackages.filter((a) => a.packageName !== app.packageName));
    } else {
      setBlockedPackages([...blockedPackages, app]);
    }
  };

  const done = () => {
    if (mode === 'settings') navigation.goBack();
    else navigation.navigate('PairTag', { mode: 'onboarding' });
  };

  // iOS nativo: FamilyActivityPicker de Apple (tokens opacos, por privacidad).
  const IosPicker = useMemo(() => {
    const DA = getDeviceActivity() as any;
    return DA?.DeviceActivitySelectionView ?? null;
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={{ flex: 1, paddingTop: 34 }}>
        <MonoLabel>Tu lista de bloqueo</MonoLabel>
        <Text style={styles.h2}>¿Qué te roba el tiempo?</Text>

        {isIosNative && IosPicker ? (
          <View style={{ flex: 1, marginTop: 24 }}>
            <View style={styles.iosPickerWrap}>
              <IosPicker
                familyActivitySelection={null}
                onSelectionChange={(event: any) => {
                  const sel = event?.nativeEvent?.familyActivitySelection;
                  const DA = getDeviceActivity() as any;
                  if (sel && typeof DA?.setFamilyActivitySelectionId === 'function') {
                    DA.setFamilyActivitySelectionId({
                      id: SELECTION_ID,
                      familyActivitySelection: sel,
                    });
                    setHasIosSelection(true);
                  }
                }}
                style={{ flex: 1, width: '100%' }}
              />
            </View>
            <Text style={styles.pickerNote}>
              Este selector lo provee Apple. Por privacidad, Apple nunca nos dice qué apps elegiste.
            </Text>
          </View>
        ) : (
          <FlatList
            style={{ marginTop: 24 }}
            data={apps}
            keyExtractor={(a) => a.packageName}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const on = selected.has(item.packageName);
              const isWhatsApp = item.packageName === 'com.whatsapp';
              return (
                <GlassCard style={styles.rowCard}>
                  <Pressable style={styles.row} onPress={() => toggle(item)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.appName}>{item.label}</Text>
                      {isWhatsApp && on && <Text style={styles.appNote}>{WHATSAPP_WARNING}</Text>}
                    </View>
                    <View style={[styles.checkbox, on && styles.checkboxOn]}>
                      {on && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                  </Pressable>
                </GlassCard>
              );
            }}
            ListFooterComponent={
              <MonoLabel size={10.5} style={{ textAlign: 'center', marginVertical: 18 }}>
                {blockedPackages.length}{' '}
                {blockedPackages.length === 1 ? 'app seleccionada' : 'apps seleccionadas'}
              </MonoLabel>
            }
          />
        )}
      </View>
      <Pill label="Listo" onPress={done} style={{ marginBottom: 18 }} />
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
  iosPickerWrap: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  pickerNote: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: palette.faint,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 17,
  },
  rowCard: { marginBottom: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 14,
  },
  appName: { fontFamily: fonts.medium, fontSize: 16, letterSpacing: -0.2, color: palette.ink },
  appNote: { fontFamily: fonts.regular, fontSize: 11.5, color: palette.green700, marginTop: 3, lineHeight: 16 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: palette.faint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: palette.green700, borderColor: palette.green700 },
  checkMark: { color: palette.cream, fontSize: 12 },
});
