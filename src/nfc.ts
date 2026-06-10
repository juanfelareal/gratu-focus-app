import { Platform } from 'react-native';

/**
 * Wrapper de NFC (react-native-nfc-manager).
 * - Lectura foreground: el usuario toca "escanear" y acerca el tag.
 * - Al vincular, escribimos `gratufocus://toggle` en el tag (NDEF): en Android
 *   el tag abre la app solo (intent filter NDEF_DISCOVERED en app.json).
 * - El UID físico del tag identifica el tag vinculado.
 * iOS background reading requiere universal link con dominio propio (fase 2).
 */

export const TOGGLE_URL = 'gratufocus://toggle';

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
 * Escanea un tag y devuelve su UID (hex), o null si se canceló/falló.
 * Con `writeToggleUrl`, además graba la URL de lanzamiento en el tag
 * (best-effort: si el tag no es escribible, el vínculo por UID basta).
 */
export async function scanTag(opts?: { writeToggleUrl?: boolean }): Promise<string | null> {
  if (!nfcLib) return null;
  const NfcManager = nfcLib.default;
  const { NfcTech, Ndef } = nfcLib;
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'Acerca tu tag Gratu al teléfono',
    });
    const tag = await NfcManager.getTag();
    if (opts?.writeToggleUrl) {
      try {
        const bytes = Ndef.encodeMessage([Ndef.uriRecord(TOGGLE_URL)]);
        if (bytes) await NfcManager.ndefHandler.writeNdefMessage(bytes);
      } catch {
        // Tag de solo lectura o sin espacio: el vínculo por UID sigue funcionando.
      }
    }
    return tag?.id ?? null;
  } catch {
    return null;
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

/**
 * Android: si la app fue abierta por un tag NFC (NDEF con nuestra URL),
 * devuelve el UID de ese tag. iOS siempre null (no aplica).
 */
export async function getLaunchTagId(): Promise<string | null> {
  if (!nfcLib || Platform.OS !== 'android') return null;
  try {
    const tag = await nfcLib.default.getLaunchTagEvent();
    return tag?.id ?? null;
  } catch {
    return null;
  }
}

export const nfcAvailable = nfcLib != null && Platform.OS !== 'web';
