/**
 * Abstracción de la capa de bloqueo.
 * - iOS: Screen Time API vía react-native-device-activity (el OS aplica el shield).
 * - Android: módulo nativo GratuBlocker (foreground service + UsageStats + overlay).
 * - Demo: cuando lo nativo no está disponible (Expo Go) la app funciona en modo simulación.
 */
export interface Blocker {
  /** true si el módulo nativo está presente en este build. */
  readonly available: boolean;
  /** Permisos listos para bloquear. */
  hasPermission(): Promise<boolean>;
  /** Pide los permisos del sistema. Devuelve true si quedaron concedidos. */
  requestPermission(): Promise<boolean>;
  /** Activa el bloqueo con la selección actual. */
  block(): Promise<void>;
  /** Desactiva el bloqueo. */
  unblock(): Promise<void>;
}
