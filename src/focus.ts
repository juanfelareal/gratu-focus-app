import { blocker } from './blocking';
import { setPackagesToBlock } from './blocking/android';
import { useStore } from './store';

/**
 * Orquesta el cambio de modo: aplica/levanta el bloqueo nativo
 * y actualiza el estado. El estado solo cambia si el bloqueo nativo no falla.
 */
export async function toggleFocus(): Promise<void> {
  const s = useStore.getState();
  if (s.focused) {
    await blocker.unblock();
    s.endFocus();
  } else {
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
