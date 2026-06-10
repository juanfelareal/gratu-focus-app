/**
 * Design tokens Gratu Focus v2 — premium calm-tech.
 * Crema cálido + orbe verde + glass cards + mono micro-labels.
 */
export const palette = {
  cream: '#F3F1EC',
  creamSoft: '#F7F5F1',
  ink: '#15211B',
  muted: '#6E7A71',
  faint: '#9AA59C',
  line: 'rgba(21,33,27,0.08)',
  glass: 'rgba(255,255,255,0.66)',
  glassBorder: 'rgba(21,33,27,0.07)',

  darkBg: '#0B100D',
  darkText: '#F3F1EC',
  darkMuted: '#93A097',
  darkFaint: '#56615A',
  darkLine: 'rgba(243,241,236,0.09)',
  darkGlass: 'rgba(255,255,255,0.045)',
  darkGlassBorder: 'rgba(243,241,236,0.09)',

  green950: '#0E2018',
  green900: '#143024',
  green700: '#1E4634',
  green500: '#2D6A4F',
  green300: '#74C69D',
  greenPale: '#A8DDC2',

  iosBlue: '#007AFF',
} as const;

export type Theme = {
  bg: string;
  text: string;
  muted: string;
  faint: string;
  line: string;
  glass: string;
  glassBorder: string;
  accent: string;
  pillBg: string;
  pillText: string;
  isDark: boolean;
};

export const lightTheme: Theme = {
  bg: palette.cream,
  text: palette.ink,
  muted: palette.muted,
  faint: palette.faint,
  line: palette.line,
  glass: palette.glass,
  glassBorder: palette.glassBorder,
  accent: palette.green500,
  pillBg: palette.green700,
  pillText: palette.cream,
  isDark: false,
};

export const darkTheme: Theme = {
  bg: palette.darkBg,
  text: palette.darkText,
  muted: palette.darkMuted,
  faint: palette.darkFaint,
  line: palette.darkLine,
  glass: palette.darkGlass,
  glassBorder: palette.darkGlassBorder,
  accent: palette.green300,
  pillBg: palette.cream,
  pillText: palette.green900,
  isDark: true,
};

export const fonts = {
  light: 'Inter_200ExtraLight',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: 'IBMPlexMono_500Medium',
} as const;

export const mono = {
  fontFamily: fonts.mono,
  fontSize: 10.5,
  letterSpacing: 2.6,
  textTransform: 'uppercase' as const,
};
