import { Platform } from 'react-native';
import type { AndroidApp } from '../store';
import type { Blocker } from './types';

/**
 * Bloqueo Android vía módulo nativo local "GratuBlocker"
 * (foreground service + UsageStatsManager + actividad escudo).
 * Permisos: Acceso de uso + Mostrar sobre otras apps.
 */

type GratuBlockerModule = {
  getInstalledApps(): Promise<AndroidApp[]>;
  hasUsageAccess(): boolean;
  hasOverlayPermission(): boolean;
  openUsageAccessSettings(): void;
  openOverlaySettings(): void;
  startBlocking(packages: string[]): void;
  stopBlocking(): void;
  isBlocking(): boolean;
};

let mod: GratuBlockerModule | null = null;
if (Platform.OS === 'android') {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    mod = requireNativeModule('GratuBlocker');
  } catch {
    mod = null;
  }
}

export function getGratuBlocker(): GratuBlockerModule | null {
  return mod;
}

/** Lista de apps instaladas (label + package) para el selector propio. */
export async function getInstalledApps(): Promise<AndroidApp[]> {
  if (!mod) return [];
  try {
    const apps = await mod.getInstalledApps();
    return apps.sort((a, b) => a.label.localeCompare(b.label));
  } catch {
    return [];
  }
}

/** El bloqueo necesita la lista actual; se setea antes de block(). */
let currentPackages: string[] = [];
export function setPackagesToBlock(packages: string[]) {
  currentPackages = packages;
}

export const androidBlocker: Blocker = {
  available: mod != null,

  async hasPermission() {
    if (!mod) return false;
    return mod.hasUsageAccess() && mod.hasOverlayPermission();
  },

  async requestPermission() {
    if (!mod) return false;
    // Los permisos de Android se conceden en Ajustes del sistema, uno por uno.
    if (!mod.hasUsageAccess()) {
      mod.openUsageAccessSettings();
      return false;
    }
    if (!mod.hasOverlayPermission()) {
      mod.openOverlaySettings();
      return false;
    }
    return true;
  },

  async block() {
    if (!mod) return;
    mod.startBlocking(currentPackages);
  },

  async unblock() {
    if (!mod) return;
    mod.stopBlocking();
  },
};
