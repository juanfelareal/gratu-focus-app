import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { fonts, palette } from '../theme';
import { nfcAvailable, scanTagId } from '../nfc';
import { Orb } from './Orb';

type Phase = 'hidden' | 'scanning' | 'done';

function Ripple({ delay }: { delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, {
        toValue: 1,
        duration: 1500,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, v]);
  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }],
        },
      ]}
    />
  );
}

/**
 * Hook + overlay del escaneo del tag.
 * Con NFC real: lee el UID y lo valida contra `expectedTagId` (si hay).
 * Sin NFC (demo/simulador): simula el toque con la misma coreografía.
 */
export function useTagScan() {
  const [phase, setPhase] = useState<Phase>('hidden');
  const [statusText, setStatusText] = useState('Buscando tu tag…');

  const scan = useCallback(
    async (opts: {
      doneLabel: string;
      expectedTagId?: string | null;
      simulate?: boolean;
      onSuccess: (tagId: string | null) => void;
    }) => {
      setStatusText('Buscando tu tag…');
      setPhase('scanning');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      let tagId: string | null = null;
      let ok = false;

      if (!opts.simulate && nfcAvailable) {
        tagId = await scanTagId();
        if (tagId == null) {
          setPhase('hidden'); // cancelado
          return;
        }
        if (opts.expectedTagId && tagId !== opts.expectedTagId) {
          setStatusText('Este no es tu tag');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          setTimeout(() => setPhase('hidden'), 1400);
          return;
        }
        ok = true;
      } else {
        // Simulación (demo / sin NFC): misma coreografía que el tag real.
        await new Promise((r) => setTimeout(r, 1100));
        ok = true;
      }

      if (ok) {
        setStatusText(opts.doneLabel);
        setPhase('done');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setTimeout(() => {
          setPhase('hidden');
          opts.onSuccess(tagId);
        }, 750);
      }
    },
    [],
  );

  const overlay = (
    <Modal visible={phase !== 'hidden'} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        {phase === 'scanning' ? (
          <View style={styles.rippleWrap}>
            <Ripple delay={0} />
            <Ripple delay={350} />
            <Ripple delay={700} />
            <Orb size={104} triRatio={0.42} breathe={false} />
          </View>
        ) : (
          <View style={styles.check}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        )}
        <Text style={styles.status}>{statusText}</Text>
      </View>
    </Modal>
  );

  return { overlay, scan, scanning: phase !== 'hidden' };
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,12,9,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 42,
  },
  rippleWrap: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1.5,
    borderColor: 'rgba(116,198,157,0.45)',
  },
  check: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: palette.green300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: palette.green300, fontSize: 28 },
  status: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: '#B9C4BC',
  },
});
