import { PermissionsAndroid, Platform } from 'react-native';
import { blocker } from './blocking';
import { setPackagesToBlock } from './blocking/android';
import { useStore } from './store';

/**
 * Orquesta el cambio de modo: aplica/levanta el bloqueo nativo
 * y actualiza el estado.
 */
export async function toggleFocus(): Promise<void> {
  const s = useStore.getState();
  if (s.focused) {
    await blocker.unblock();
    s.endFocus();
  } else {
    await ensureAndroidNotificationPermission();
    setPackagesToBlock(s.blockedPackages.map((a) => a.packageName));
    await blocker.block();
    s.startFocus();
  }
}

/** Desbloqueo de emergencia: levanta el bloqueo y descuenta una emergencia. */
export async function emergencyUnlock(): Promise<void> {
  await blocker.unblock();
  useStore.getState().useEmergency();
}

/**
 * Android 13+: el foreground service muestra una notificación persistente
 * ("Modo enfoque activo") — requiere POST_NOTIFICATIONS en runtime.
 * Si el usuario la niega, el bloqueo funciona igual (solo no ve la notificación).
 */
async function ensureAndroidNotificationPermission(): Promise<void> {
  if (Platform.OS !== 'android' || Platform.Version < 33) return;
  try {
    await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS');
  } catch {
    // No bloquea el flujo.
  }
}
