import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { darkTheme, lightTheme, Theme } from './theme';

export type AndroidApp = { label: string; packageName: string };

/** Clave local 'YYYY-MM-DD' (zona horaria del dispositivo). */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type State = {
  onboarded: boolean;
  strict: boolean;
  emergencyLeft: number;
  /** Minutos recuperados por día: { 'YYYY-MM-DD': minutos }. */
  history: Record<string, number>;
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
  history: {} as Record<string, number>,
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
        const { focusStartedAt, history } = get();
        const session = focusStartedAt ? (Date.now() - focusStartedAt) / 60000 : 0;
        const key = dateKey();
        set({
          focused: false,
          focusStartedAt: null,
          history: { ...history, [key]: (history[key] ?? 0) + session },
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
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted: any, version) => {
        if (version < 2 && persisted) {
          // v1 guardaba un total plano `recoveredMin`; lo atribuimos a hoy.
          persisted.history = persisted.recoveredMin
            ? { [dateKey()]: persisted.recoveredMin }
            : {};
          delete persisted.recoveredMin;
          delete persisted.streak;
        }
        return persisted as State;
      },
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

/** Total histórico de minutos recuperados (sin la sesión activa). */
export function totalRecovered(history: Record<string, number>): number {
  return Object.values(history).reduce((a, b) => a + b, 0);
}

/** Minutos de la semana actual (lunes a domingo), índice 0 = lunes. */
export function currentWeek(history: Record<string, number>): number[] {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - mondayOffset + i);
    return history[dateKey(d)] ?? 0;
  });
}

/**
 * Racha: días consecutivos con al menos 10 minutos de enfoque,
 * contando hacia atrás desde hoy (o desde ayer si hoy aún no llega al umbral).
 */
export function computeStreak(history: Record<string, number>, minPerDay = 10): number {
  let streak = 0;
  const d = new Date();
  if ((history[dateKey(d)] ?? 0) >= minPerDay) {
    streak = 1;
  }
  d.setDate(d.getDate() - 1);
  while ((history[dateKey(d)] ?? 0) >= minPerDay) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** Formato "1h 23m". */
export function fmtMin(min: number): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  return `${h}h ${r.toString().padStart(2, '0')}m`;
}
