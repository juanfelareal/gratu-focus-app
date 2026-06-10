import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { darkTheme, lightTheme, Theme } from './theme';

export type AndroidApp = { label: string; packageName: string };

export type State = {
  onboarded: boolean;
  strict: boolean;
  emergencyLeft: number;
  recoveredMin: number;
  streak: number;
  focused: boolean;
  focusStartedAt: number | null;
  /** ID del tag NFC vinculado (hex). Null = aún sin vincular. */
  tagId: string | null;
  /** Android: paquetes bloqueados. */
  blockedPackages: AndroidApp[];
  /** iOS: si el usuario ya eligió apps con el picker de Apple. */
  hasIosSelection: boolean;

  completeOnboarding: (tagId: string | null) => void;
  startFocus: () => void;
  endFocus: () => void;
  useEmergency: () => void;
  setStrict: (v: boolean) => void;
  setBlockedPackages: (apps: AndroidApp[]) => void;
  setHasIosSelection: (v: boolean) => void;
  setTagId: (id: string | null) => void;
  resetAll: () => void;
};

const initial = {
  onboarded: false,
  strict: true,
  emergencyLeft: 5,
  recoveredMin: 0,
  streak: 0,
  focused: false,
  focusStartedAt: null as number | null,
  tagId: null as string | null,
  blockedPackages: [] as AndroidApp[],
  hasIosSelection: false,
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,

      completeOnboarding: (tagId) => set({ onboarded: true, tagId }),

      startFocus: () => set({ focused: true, focusStartedAt: Date.now() }),

      endFocus: () => {
        const { focusStartedAt, recoveredMin } = get();
        const session = focusStartedAt ? (Date.now() - focusStartedAt) / 60000 : 0;
        set({
          focused: false,
          focusStartedAt: null,
          recoveredMin: recoveredMin + session,
        });
      },

      useEmergency: () => {
        const { emergencyLeft } = get();
        set({ emergencyLeft: Math.max(0, emergencyLeft - 1) });
        get().endFocus();
      },

      setStrict: (v) => set({ strict: v }),
      setBlockedPackages: (apps) => set({ blockedPackages: apps }),
      setHasIosSelection: (v) => set({ hasIosSelection: v }),
      setTagId: (id) => set({ tagId: id }),
      resetAll: () => set({ ...initial }),
    }),
    {
      name: 'gratu-focus-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Tema según estado: crema en libre, oscuro profundo en enfoque. */
export function useTheme(): Theme {
  const focused = useStore((s) => s.focused);
  return focused ? darkTheme : lightTheme;
}

/** Minutos de la sesión de enfoque actual. */
export function sessionMinutes(focusStartedAt: number | null): number {
  return focusStartedAt ? (Date.now() - focusStartedAt) / 60000 : 0;
}

/** Formato "1h 23m". */
export function fmtMin(min: number): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  return `${h}h ${r.toString().padStart(2, '0')}m`;
}
