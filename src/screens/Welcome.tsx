import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Orb } from '../components/Orb';
import { MonoLabel, Pill } from '../components/ui';
import type { Nav } from '../nav';
import { palette, fonts } from '../theme';

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.center}>
        <Orb size={168} />
        <MonoLabel style={{ marginTop: 52, marginBottom: 18 }}>GRATU&nbsp;&nbsp;FOCUS</MonoLabel>
        <Text style={styles.tagline}>
          Tu tag.{'\n'}
          <Text style={styles.taglineBold}>Tu tiempo.</Text>
        </Text>
        <Pill label="Empezar" onPress={() => navigation.navigate('How')} style={{ marginTop: 56 }} />
      </View>
      <MonoLabel size={9.5} color={palette.faint} style={styles.foot}>
        Hecho en Colombia
      </MonoLabel>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.cream, paddingHorizontal: 28 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tagline: {
    fontFamily: fonts.light,
    fontSize: 40,
    letterSpacing: -1.6,
    lineHeight: 46,
    color: palette.ink,
    textAlign: 'center',
  },
  taglineBold: { fontFamily: fonts.semibold },
  foot: { textAlign: 'center', paddingBottom: 18 },
});
