/**
 * The single source of truth for visual values.
 *
 * Screens and components must not contain raw hex colors or font sizes.
 * Semantic colors are resolved per mode in `theme.tsx`.
 */

export const colors = {
  light: {
    bg: '#FAF8F1',
    surface: '#FFFDF7',
    sunken: '#F2EEE3',
    border: '#E3DDCC',
    borderStrong: '#CFC7B2',
    text: '#1F2119',
    muted: '#5B5F52',
    faint: '#666A5D',
    primary: '#3E7A4A',
    primaryText: '#2E6B3C',
    primarySoft: '#DCEBD8',
    primarySoftText: '#245832',
    onPrimary: '#FFFDF7',
    accent: '#A45D24',
    accentSoft: '#F6E5D3',
    accentSoftText: '#8A4A1B',
    heatFull: '#2E6B3C',
    heatMin: '#5E9B66',
    heatEmpty: '#EFEADD',
    heatEmptyBorder: '#DED6C3',
    heatSkipped: '#A8A18F',
    danger: '#9C3A2A',
    dangerSoft: '#F7E1DB',
    dangerSoftText: '#7E2E20',
    focus: '#3E7A4A',
    plantLeaf: '#5E9B66',
    plantLeafLight: '#8FBE8C',
    plantPot: '#B4713F',
    plantPotDark: '#8A4A1B',
    plantSoil: '#6B5A45',
    overlay: 'rgba(31, 33, 25, 0.32)',
  },
  dark: {
    bg: '#16150F',
    surface: '#1F1D16',
    sunken: '#26241B',
    border: '#37342A',
    borderStrong: '#4C4838',
    text: '#F1EEE3',
    muted: '#B3AE9F',
    faint: '#8A8E7D',
    primary: '#93CE9B',
    primaryText: '#93CE9B',
    primarySoft: '#24331F',
    primarySoftText: '#A9D8AE',
    onPrimary: '#10200F',
    accent: '#E3A36C',
    accentSoft: '#3A2A1B',
    accentSoftText: '#EBC49B',
    heatFull: '#7BCB8A',
    heatMin: '#41754C',
    heatEmpty: '#26241B',
    heatEmptyBorder: '#37342A',
    heatSkipped: '#7C8271',
    danger: '#F0A091',
    dangerSoft: '#3A1F19',
    dangerSoftText: '#F5BFB3',
    focus: '#93CE9B',
    plantLeaf: '#6FBF7F',
    plantLeafLight: '#A9D8AE',
    plantPot: '#C98A5A',
    plantPotDark: '#8A4A1B',
    plantSoil: '#6B5A45',
    overlay: 'rgba(0, 0, 0, 0.55)',
  },
} as const;

export type ColorMode = keyof typeof colors;
export type ThemeColors = { [K in keyof typeof colors.light]: string };

/** 4pt base scale. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const layout = {
  screenPadding: space.xl,
  cardPadding: space.lg,
  cardGap: space.md,
  sectionGap: space.xxxl,
  minTarget: 48,
  maxContentWidth: 560,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const fonts = {
  display: 'Fraunces-SemiBold',
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  semibold: 'DMSans-SemiBold',
} as const;

export const typeScale = {
  display: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
} as const;

export type TypeVariant = keyof typeof typeScale;

export const motion = {
  fast: 160,
  base: 220,
  slow: 280,
  easing: [0.2, 0, 0, 1] as const,
} as const;

export const icons = {
  sm: 20,
  md: 24,
  stroke: 1.75,
} as const;

export const elevation = {
  sheet: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;

export const opacity = {
  pressed: 0.72,
  disabled: 0.4,
} as const;
