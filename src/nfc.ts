import { Platform } from 'react-native';

/**
 * Wrapper de NFC (react-native-nfc-manager).
 * MVP: lectura en foreground — el usuario toca "escanear" y acerca el tag.
 * El ID físico del tag (UID) identifica el tag vinculado.
 * Fase 2: background reading (iOS universal link / Android intent filter).
 */

type NfcManagerModule = typeof import('react-native-nfc-manager');

let nfcLib: NfcManagerModule | null = null;
try {
  nfcLib = require('react-native-nfc-manager');
} catch {
  nfcLib = null;
}

let started = false;

export async function nfcIsSupported(): Promise<boolean> {
  if (!nfcLib) return false;
  try {
    const NfcManager = nfcLib.default;
    const supported = await NfcManager.isSupported();
    if (supported && !started) {
      await NfcManager.start();
      started = true;
    }
    return supported;
  } catch {
    return false;
  }
}

/**
 * Escanea un tag y devuelve su UID (hex) o null si se canceló/falló.
 * En iOS muestra el sheet de escaneo del sistema.
 */
export async function scanTagId(): Promise<string | null> {
  if (!nfcLib) return null;
  const NfcManager = nfcLib.default;
  const { NfcTech } = nfcLib;
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'Acerca tu tag Gratu al teléfono',
    });
    const tag = await NfcManager.getTag();
    return tag?.id ?? null;
  } catch {
    return null;
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

export const nfcAvailable = nfcLib != null && Platform.OS !== 'web';
