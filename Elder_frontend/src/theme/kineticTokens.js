import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Fluid typography based on window width
// clamp(min, preferred, max) logic
const clamp = (min, preferred, max) => {
  return Math.max(min, Math.min(preferred, max));
};

export const kineticColors = {
  background: '#09090B',
  foreground: '#FAFAFA',
  muted: '#27272A',
  mutedForeground: '#A1A1AA',
  accent: '#DFE104',
  accentForeground: '#000000',
  border: '#3F3F46',
  transparent: 'transparent',
};

export const kineticTypography = {
  // Hero/Display: text-[clamp(3rem,12vw,14rem)] -> e.g. 48px to 224px
  hero: {
    fontSize: clamp(64, width * 0.15, 200),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -4,
    lineHeight: clamp(64, width * 0.15, 200) * 0.85,
  },
  // Section Headings: text-5xl md:text-7xl lg:text-8xl -> roughly 48px to 96px
  heading: {
    fontSize: clamp(48, width * 0.1, 150),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -2,
    lineHeight: clamp(48, width * 0.1, 150) * 0.9,
  },
  // Subheadings for constrained columns
  subheading: {
    fontSize: clamp(32, width * 0.06, 72),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -1,
    lineHeight: clamp(32, width * 0.06, 72) * 1.0,
  },
  // Card Titles: text-2xl md:text-3xl -> roughly 24px to 36px
  cardTitle: {
    fontSize: clamp(24, width * 0.06, 48),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  // Body/Descriptions: text-lg -> roughly 18px to 24px
  body: {
    fontSize: clamp(18, width * 0.04, 24),
    fontWeight: '500',
    color: kineticColors.mutedForeground,
    lineHeight: clamp(18, width * 0.04, 24) * 1.4,
  },
  // Small Labels: 12-18px
  label: {
    fontSize: clamp(12, width * 0.03, 18),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Numbers
  massiveNumber: {
    fontSize: clamp(96, width * 0.2, 192),
    fontWeight: '700',
    color: kineticColors.muted,
  }
};

export const kineticSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 32,
  xl: 48,
  xxl: 128,
};

export const kineticRadii = {
  none: 0,
  sm: 2,
};

export const kineticBorders = {
  width: 2,
  hairline: 1,
  color: kineticColors.border,
};
