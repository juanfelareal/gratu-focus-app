import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../store';
import { fonts } from '../theme';
import { HomeScreen } from './Home';
import { SettingsScreen } from './Settings';
import { StatsScreen } from './Stats';

type Tab = 'home' | 'stats' | 'settings';

const TABS: { key: Tab; label: string }[] = [
  { key: 'home', label: 'Inicio' },
  { key: 'stats', label: 'Stats' },
  { key: 'settings', label: 'Ajustes' },
];

/** Contenedor principal con tab bar pill flotante. */
export function MainScreen() {
  const t = useTheme();
  const [tab, setTab] = useState<Tab>('home');

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]} edges={['top']}>
      <View style={{ flex: 1 }}>
        {tab === 'home' && <HomeScreen />}
        {tab === 'stats' && <StatsScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </View>
      <View style={styles.tabbarWrap} pointerEvents="box-none">
        <View
          style={[
            styles.tabbar,
            { backgroundColor: t.glass, borderColor: t.glassBorder },
            !t.isDark && styles.tabbarShadow,
          ]}
        >
          {TABS.map(({ key, label }) => {
            const on = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={[styles.tabBtn, on && { backgroundColor: t.pillBg }]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: on ? t.pillText : t.muted },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabbarWrap: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabbar: {
    flexDirection: 'row',
    gap: 4,
    padding: 5,
    borderRadius: 100,
    borderWidth: 1,
  },
  tabbarShadow: {
    shadowColor: '#15211B',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  tabBtn: {
    paddingHorizontal: 19,
    paddingVertical: 10,
    borderRadius: 100,
  },
  tabLabel: { fontFamily: fonts.semibold, fontSize: 13, letterSpacing: -0.1 },
});
