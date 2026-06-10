import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, palette } from '../theme';
import { useStore } from '../store';

/**
 * Modal de desbloqueo de emergencia con fricción deliberada:
 * botón deshabilitado 5 segundos antes de poder confirmar.
 */
export function EmergencyModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const emergencyLeft = useStore((s) => s.emergencyLeft);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!visible) return;
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) clearInterval(interval);
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  const ready = countdown <= 0;
  const none = emergencyLeft <= 0;

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>¿Es una emergencia de verdad?</Text>
          <Text style={styles.body}>
            {none
              ? 'Ya no te quedan emergencias. Solo tu tag abre el muro. Ve por él.'
              : `Te quedan ${emergencyLeft} desbloqueos de emergencia — para toda la vida. Cuando se acaben, solo tu tag abre el muro.`}
          </Text>
          {!none && (
            <Pressable
              disabled={!ready}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirm,
                { opacity: !ready ? 0.35 : pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.confirmLabel}>
                {ready ? 'Sí, usar 1 emergencia' : `Espera ${countdown}s…`}
              </Text>
            </Pressable>
          )}
          <Pressable onPress={onClose}>
            <Text style={styles.cancel}>Mejor sigo enfocado</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,12,9,0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: palette.creamSoft,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 44,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 21,
    letterSpacing: -0.6,
    color: palette.ink,
    marginBottom: 10,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 23,
    color: palette.muted,
    textAlign: 'center',
    marginBottom: 26,
  },
  confirm: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 17,
    borderRadius: 100,
    backgroundColor: palette.green700,
  },
  confirmLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15.5,
    color: palette.cream,
  },
  cancel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: palette.muted,
    paddingTop: 20,
  },
});
