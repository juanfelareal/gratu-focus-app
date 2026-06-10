import { Platform } from 'react-native';
import type { Blocker } from './types';

/**
 * Bloqueo iOS vía Screen Time API (react-native-device-activity).
 * El shield lo aplica el sistema: sobrevive matar la app y reiniciar el iPhone.
 * Requiere el entitlement "Family Controls" (development funciona local;
 * distribution requiere aprobación de Apple — ver README).
 */

// ID con el que persistimos la selección del FamilyActivityPicker.
export const SELECTION_ID = 'gratu-focus-selection';

type DeviceActivityModule = typeof import('react-native-device-activity');

let DA: DeviceActivityModule | null = null;
if (Platform.OS === 'ios') {
  try {
    // require dinámico: en Expo Go el módulo nativo no existe.
    DA = require('react-native-device-activity');
  } catch {
    DA = null;
  }
}

export function getDeviceActivity(): DeviceActivityModule | null {
  return DA;
}

function shieldConfig() {
  // Pantalla escudo del sistema, personalizada con la voz de Gratu.
  return {
    title: 'Esta app puede esperar.',
    subtitle: 'Estás en modo enfoque. Tu tag está donde lo dejaste — termina lo que empezaste.',
    primaryButtonLabel: 'Volver a lo importante',
    iconSystemName: 'leaf.fill',
  };
}

export const iosBlocker: Blocker = {
  available: DA != null,

  async hasPermission() {
    if (!DA) return false;
    try {
      const anyDA = DA as any;
      if (typeof anyDA.getAuthorizationStatus === 'function') {
        const status = anyDA.getAuthorizationStatus();
        return status === 2 || status === 'approved';
      }
      return false;
    } catch {
      return false;
    }
  },

  async requestPermission() {
    if (!DA) return false;
    try {
      await (DA as any).requestAuthorization();
      return true;
    } catch {
      return false;
    }
  },

  async block() {
    if (!DA) return;
    const anyDA = DA as any;
    try {
      if (typeof anyDA.updateShield === 'function') {
        anyDA.updateShield(shieldConfig(), { primary: { behavior: 'close' } });
      }
    } catch {
      // La personalización del shield es opcional; el bloqueo no depende de ella.
    }
    anyDA.blockSelection({ activitySelectionId: SELECTION_ID });
  },

  async unblock() {
    if (!DA) return;
    (DA as any).unblockSelection({ activitySelectionId: SELECTION_ID });
  },
};
