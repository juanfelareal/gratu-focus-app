import { Platform } from 'react-native';
import { androidBlocker } from './android';
import { iosBlocker } from './ios';
import type { Blocker } from './types';

/** Modo simulación (Expo Go / sin módulos nativos): la UI funciona completa. */
const demoBlocker: Blocker = {
  available: false,
  hasPermission: async () => true,
  requestPermission: async () => true,
  block: async () => {},
  unblock: async () => {},
};

export const blocker: Blocker = (() => {
  if (Platform.OS === 'ios' && iosBlocker.available) return iosBlocker;
  if (Platform.OS === 'android' && androidBlocker.available) return androidBlocker;
  return demoBlocker;
})();

/** true cuando el build no tiene capa nativa y todo es simulado. */
export const isDemoMode = !blocker.available;

export * from './types';
