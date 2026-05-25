// Web-compatible theme — no react-native dependency
// useColorScheme is imported from next-themes or native media query on web
function useColorScheme(): 'light' | 'dark' | null {
  if (typeof window === 'undefined') return null;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const Platform = {
  OS: 'web' as const,
  select: <T>(spec: { ios?: T; android?: T; web?: T; default?: T }): T =>
    (spec.web ?? spec.default) as T,
};

// Couleurs Scolarix — thème clair (défaut)
// Orange CI = travail & acharnement | Vert CI = succès | Or = excellence | Ivoire = Côte d'Ivoire
export const SCOLARIX = {
  bleu: '#D4500A',       // Orange CI primaire — travail, acharnement
  bleuLight: '#E8621A',
  bleuDark: '#A33B06',
  rouge: '#007A38',      // Vert CI — succès, espoir
  rougeLight: '#1A9252',
  background: '#FFF8F0', // Ivoire doux — identité CI
  surface: '#FFFFFF',
  textPrimary: '#1A0E06',
  textSecondary: '#5C4033',
  textMuted: '#9C7C6A',
  border: '#F0D0B0',
  success: '#007A38',
  warning: '#F4A800',    // Or — excellence, réussite
  error: '#D32F2F',
  rougeVif: '#F4A800',   // Or — accent succès
  info: '#D4500A',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Couleurs Scolarix — thème sombre
export const SCOLARIX_DARK = {
  bleu: '#FF7B30',       // Orange lumineux sur fond sombre
  bleuLight: '#FF9550',
  bleuDark: '#E06020',
  rouge: '#2AB55A',      // Vert lumineux
  rougeLight: '#44CC7A',
  background: '#0F0800',
  surface: '#1E1008',
  textPrimary: '#FFF5EC',
  textSecondary: '#D4B8A8',
  textMuted: '#8C6C5C',
  border: '#3C2010',
  success: '#2AB55A',
  warning: '#FFB800',
  error: '#EF5350',
  rougeVif: '#FFB800',
  info: '#FF7B30',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export type ScolarixTheme = typeof SCOLARIX;

/** Hook renvoyant les couleurs adaptées au mode clair/sombre de l'OS */
export function useScolarixTheme(): ScolarixTheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? SCOLARIX_DARK : SCOLARIX;
}

export const Colors = {
  light: {
    text: '#1A0E06',
    background: '#FFF8F0',
    tint: '#D4500A',
    icon: '#5C4033',
    tabIconDefault: '#9C7C6A',
    tabIconSelected: '#D4500A',
    surface: '#FFFFFF',
    border: '#F0D0B0',
  },
  dark: {
    text: '#FFF5EC',
    background: '#0F0800',
    tint: '#FF7B30',
    icon: '#D4B8A8',
    tabIconDefault: '#8C6C5C',
    tabIconSelected: '#FF7B30',
    surface: '#1E1008',
    border: '#3C2010',
  },
};

export const FontFamily = {
  regular: 'ReadexPro_400Regular',
  medium: 'ReadexPro_500Medium',
  bold: 'ReadexPro_700Bold',
};

/** Échelle d'espacement cohérente (multiples de 4) */
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

/** Échelle de border-radius */
export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  full: 999,
} as const;

/** Ombres portées prêtes à l'emploi */
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

/** Échelle typographique */
export const Typography = {
  xs:   { fontSize: 11, lineHeight: 16 },
  sm:   { fontSize: 12, lineHeight: 18 },
  base: { fontSize: 14, lineHeight: 20 },
  md:   { fontSize: 15, lineHeight: 22 },
  lg:   { fontSize: 16, lineHeight: 24 },
  xl:   { fontSize: 18, lineHeight: 26 },
  '2xl':{ fontSize: 20, lineHeight: 28 },
  '3xl':{ fontSize: 24, lineHeight: 32 },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
