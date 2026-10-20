// WHATS POPPIN design tokens. Screens never hard-code colors or sizes; they use these.
// Every text/background pair below meets WCAG AA (4.5:1) — see README "Design system".

export const colors = {
  primary: '#C2410C',
  primaryPressed: '#9A3412',
  primarySoft: '#FFEDD5',
  onPrimary: '#FFFFFF',

  text: '#111827',
  textSecondary: '#4B5563',
  textInverse: '#FFFFFF',

  background: '#FFFFFF',
  surface: '#F5F5F4',
  surfacePressed: '#E7E5E4',
  border: '#D6D3D1',
  borderStrong: '#78716C',
  overlay: 'rgba(17, 24, 39, 0.55)',

  statusOpen: '#15803D',
  statusOpenSoft: '#DCFCE7',
  statusSoon: '#B45309',
  statusSoonSoft: '#FEF3C7',
  statusNeutral: '#4B5563',
  statusNeutralSoft: '#F3F4F6',

  sponsored: '#5C4300',
  sponsoredSoft: '#FFE9A8',

  error: '#B91C1C',
  errorSoft: '#FEE2E2',

  focus: '#2563EB',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  /** Horizontal padding of every screen */
  screen: 16,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Minimum touch target (accessibility guidelines say 44–48). */
export const TOUCH_MIN = 48;

export const fonts = {
  regular: 'Rubik_400Regular',
  medium: 'Rubik_500Medium',
  semibold: 'Rubik_600SemiBold',
  bold: 'Rubik_700Bold',
} as const;

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'meta' | 'metaStrong' | 'button';

/** Font size / line height. Nothing in the app goes below 15. */
export const typography: Record<TextVariant, { fontFamily: string; fontSize: number; lineHeight: number }> = {
  display: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34 },
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 },
  heading: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 24 },
  meta: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 20 },
  metaStrong: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20 },
  button: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
} as const;

export const theme = { colors, spacing, radius, fonts, typography, shadow, TOUCH_MIN };
