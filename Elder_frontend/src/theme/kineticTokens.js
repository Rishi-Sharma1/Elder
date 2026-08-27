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
  // Hero/Display: clamp(36px to 72px)
  hero: {
    fontSize: clamp(36, width * 0.05, 72),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -2,
    lineHeight: clamp(36, width * 0.05, 72) * 0.95,
  },
  // Section Headings: clamp(28px to 52px)
  heading: {
    fontSize: clamp(28, width * 0.04, 52),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -1.5,
    lineHeight: clamp(28, width * 0.04, 52) * 1.0,
  },
  // Subheadings for constrained columns
  subheading: {
    fontSize: clamp(22, width * 0.03, 36),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: -1,
    lineHeight: clamp(22, width * 0.03, 36) * 1.05,
  },
  // Card Titles: clamp(16px to 22px)
  cardTitle: {
    fontSize: clamp(16, width * 0.02, 22),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  // Body/Descriptions: clamp(14px to 17px)
  body: {
    fontSize: clamp(14, width * 0.015, 17),
    fontWeight: '500',
    color: kineticColors.mutedForeground,
    lineHeight: clamp(14, width * 0.015, 17) * 1.4,
  },
  // Small Labels: 11-13px
  label: {
    fontSize: clamp(11, width * 0.012, 13),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Numbers
  massiveNumber: {
    fontSize: clamp(48, width * 0.08, 96),
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
