/**
 * Доступные варианты темы приложения.
 */
export type ThemeVariant =
  | 'sageLibrary'
  | 'linen'
  | 'slate'
  | 'dustyPlum'
  | 'navy'
  | 'inkLight'
  | 'sageDark'
  | 'dune'
  | 'slateDark'
  | 'plumDark'
  | 'navyDark'
  | 'ink'

/** Дефолтная тема приложения. */
export const DEFAULT_THEME: ThemeVariant = 'inkLight'

/**
 * Сырые цветовые токены темы — независимы от MUI.
 * app/styles/theme.ts строит из них MUI-палитру.
 */
export interface ThemeColors {
  /** Основной акцент. */
  primary: string
  primaryLight: string
  primaryDark: string
  primaryContrast: string
  /** Вторичный акцент. */
  secondary: string
  secondaryLight: string
  secondaryDark: string
  secondaryContrast: string
  /** Фон страницы и поверхностей. */
  bgDefault: string
  bgPaper: string
  /** Основной и вспомогательный текст. */
  textPrimary: string
  textSecondary: string
  /** Разделитель. */
  divider: string
  /** Сайдбар. */
  sidebarBg: string
  sidebarText: string
  sidebarMuted: string
  sidebarActiveBackground: string
  sidebarDivider: string
  /** Флаг тёмной темы — MUI будет использовать mode: 'dark'. */
  isDark?: boolean
  /** Акцентная поверхность для тёмных блоков (bento dark cell и т.п.). */
  surfaceVariant?: string
  /** Тип анимации на главной странице. */
  particle?: 'leaf' | 'dust' | 'dot' | 'ember'
  /** Парная тема (светлая ↔ тёмная). */
  pair: ThemeVariant
}

/**
 * Цветовые токены всех тем.
 */
export const THEME_COLORS: Record<ThemeVariant, ThemeColors> = {
  sageLibrary: {
    pair: 'sageDark',
    particle: 'leaf',
    primary: '#4E7B6A',
    primaryLight: '#6E9B8A',
    primaryDark: '#3D6A59',
    primaryContrast: '#FAFCF9',
    secondary: '#8B7355',
    secondaryLight: '#A89070',
    secondaryDark: '#6E5A40',
    secondaryContrast: '#FAFCF9',
    bgDefault: '#F2F5F1',
    bgPaper: '#FAFCF9',
    textPrimary: '#1E3328',
    textSecondary: '#5A7A6A',
    divider: '#D5E4D8',
    sidebarBg: '#243D35',
    sidebarText: '#D8EBE4',
    sidebarMuted: 'rgba(216,235,228,0.5)',
    sidebarActiveBackground: 'rgba(255,255,255,0.09)',
    sidebarDivider: 'rgba(255,255,255,0.07)',
  },
  linen: {
    pair: 'dune',
    particle: 'dust',
    primary: '#8C5A3C',
    primaryLight: '#A87D5A',
    primaryDark: '#75482E',
    primaryContrast: '#FBF8F2',
    secondary: '#7A6A5A',
    secondaryLight: '#9A8A7A',
    secondaryDark: '#5A5040',
    secondaryContrast: '#FBF8F2',
    bgDefault: '#F5F1EA',
    bgPaper: '#FBF8F2',
    textPrimary: '#2B2520',
    textSecondary: '#7A6A5A',
    divider: '#E5DDCE',
    sidebarBg: '#2B2520',
    sidebarText: '#EDE3D4',
    sidebarMuted: 'rgba(237,227,212,0.5)',
    sidebarActiveBackground: 'rgba(255,255,255,0.08)',
    sidebarDivider: 'rgba(255,255,255,0.07)',
  },
  slate: {
    pair: 'slateDark',
    particle: 'dot',
    primary: '#4361B0',
    primaryLight: '#6481C8',
    primaryDark: '#3451A0',
    primaryContrast: '#FFFFFF',
    secondary: '#5A6580',
    secondaryLight: '#7A85A0',
    secondaryDark: '#3A4560',
    secondaryContrast: '#FFFFFF',
    bgDefault: '#F7F8FA',
    bgPaper: '#FFFFFF',
    textPrimary: '#1A2035',
    textSecondary: '#5A6580',
    divider: '#E2E6EF',
    sidebarBg: '#1E2535',
    sidebarText: '#CBD5E8',
    sidebarMuted: 'rgba(203,213,232,0.5)',
    sidebarActiveBackground: 'rgba(255,255,255,0.08)',
    sidebarDivider: 'rgba(255,255,255,0.07)',
  },
  dustyPlum: {
    pair: 'plumDark',
    particle: 'dust',
    primary: '#7C5CA8',
    primaryLight: '#9C7CC8',
    primaryDark: '#6B4C97',
    primaryContrast: '#FFFFFF',
    secondary: '#6B5880',
    secondaryLight: '#8B78A0',
    secondaryDark: '#4B3860',
    secondaryContrast: '#FFFFFF',
    bgDefault: '#F6F4FA',
    bgPaper: '#FDFBFF',
    textPrimary: '#1E1530',
    textSecondary: '#6B5880',
    divider: '#E3DCF0',
    sidebarBg: '#2D1F45',
    sidebarText: '#DDD5EE',
    sidebarMuted: 'rgba(221,213,238,0.5)',
    sidebarActiveBackground: 'rgba(255,255,255,0.09)',
    sidebarDivider: 'rgba(255,255,255,0.07)',
  },
  navy: {
    pair: 'navyDark',
    particle: 'dot',
    primary: '#3B4A66',
    primaryLight: '#5B6A86',
    primaryDark: '#2D3B53',
    primaryContrast: '#FFFFFF',
    secondary: '#5A6478',
    secondaryLight: '#7A8498',
    secondaryDark: '#3A4458',
    secondaryContrast: '#FFFFFF',
    bgDefault: '#F4F5F7',
    bgPaper: '#FFFFFF',
    textPrimary: '#1A1F2A',
    textSecondary: '#5A6478',
    divider: '#DDE1E8',
    sidebarBg: '#181C24',
    sidebarText: '#D6DBE6',
    sidebarMuted: 'rgba(214,219,230,0.5)',
    sidebarActiveBackground: 'rgba(255,255,255,0.08)',
    sidebarDivider: 'rgba(255,255,255,0.07)',
  },
  inkLight: {
    pair: 'ink',
    particle: 'ember',
    primary: '#A8623A',
    primaryLight: '#C97B5C',
    primaryDark: '#8A4E2C',
    primaryContrast: '#FFFFFF',
    secondary: '#8A6A5A',
    secondaryLight: '#AA8A7A',
    secondaryDark: '#6A4A3A',
    secondaryContrast: '#FFFFFF',
    bgDefault: '#F4EFE8',
    bgPaper: '#FAF7F2',
    textPrimary: '#2A1F15',
    textSecondary: '#7A5A48',
    divider: '#E5DDD0',
    sidebarBg: '#2A1F15',
    sidebarText: '#F5E8D8',
    sidebarMuted: 'rgba(245,232,216,0.5)',
    sidebarActiveBackground: 'rgba(255,255,255,0.09)',
    sidebarDivider: 'rgba(255,255,255,0.07)',
  },

  // ─── Тёмные пары к светлым темам ─────────────────────────────────────────────

  sageDark: {
    pair: 'sageLibrary',
    isDark: true,
    particle: 'leaf',
    surfaceVariant: '#1E2D28',
    primary: '#6E9B8A',
    primaryLight: '#8EBDAC',
    primaryDark: '#5E8B7A',
    primaryContrast: '#FFFFFF',
    secondary: '#5A7A6A',
    secondaryLight: '#7A9A8A',
    secondaryDark: '#3A5A4A',
    secondaryContrast: '#FFFFFF',
    bgDefault: '#141A17',
    bgPaper: '#1A2220',
    textPrimary: '#D8EBE4',
    textSecondary: '#8AADA4',
    divider: '#253028',
    sidebarBg: '#0D1210',
    sidebarText: '#D8EBE4',
    sidebarMuted: 'rgba(216,235,228,0.45)',
    sidebarActiveBackground: 'rgba(255,255,255,0.06)',
    sidebarDivider: 'rgba(255,255,255,0.05)',
  },
  dune: {
    pair: 'linen',
    isDark: true,
    particle: 'dust',
    surfaceVariant: '#2A2521',
    primary: '#C8A26A',
    primaryLight: '#D4B98A',
    primaryDark: '#B58F58',
    primaryContrast: '#FFFFFF',
    secondary: '#948977',
    secondaryLight: '#B4A997',
    secondaryDark: '#746957',
    secondaryContrast: '#FFFFFF',
    bgDefault: '#1A1715',
    bgPaper: '#221E1B',
    textPrimary: '#EFE7D7',
    textSecondary: '#948977',
    divider: '#2E2A26',
    sidebarBg: '#100E0C',
    sidebarText: '#E8DFD0',
    sidebarMuted: 'rgba(232,223,208,0.45)',
    sidebarActiveBackground: 'rgba(255,255,255,0.06)',
    sidebarDivider: 'rgba(255,255,255,0.05)',
  },
  slateDark: {
    pair: 'slate',
    isDark: true,
    particle: 'dot',
    surfaceVariant: '#1E2438',
    primary: '#6481C8',
    primaryLight: '#849BE8',
    primaryDark: '#5471B8',
    primaryContrast: '#FFFFFF',
    secondary: '#5A6A90',
    secondaryLight: '#7A8AB0',
    secondaryDark: '#3A4A70',
    secondaryContrast: '#FFFFFF',
    bgDefault: '#111318',
    bgPaper: '#171A22',
    textPrimary: '#D6DBE6',
    textSecondary: '#8E97B0',
    divider: '#22273A',
    sidebarBg: '#0B0D14',
    sidebarText: '#D6DBE6',
    sidebarMuted: 'rgba(214,219,230,0.45)',
    sidebarActiveBackground: 'rgba(255,255,255,0.06)',
    sidebarDivider: 'rgba(255,255,255,0.05)',
  },
  plumDark: {
    pair: 'dustyPlum',
    isDark: true,
    particle: 'dust',
    surfaceVariant: '#1E1A2E',
    primary: '#9C7CC8',
    primaryLight: '#BCA0E0',
    primaryDark: '#8C6CB8',
    primaryContrast: '#FFFFFF',
    secondary: '#8070A0',
    secondaryLight: '#A090C0',
    secondaryDark: '#604080',
    secondaryContrast: '#FFFFFF',
    bgDefault: '#120F1A',
    bgPaper: '#181422',
    textPrimary: '#DDD5EE',
    textSecondary: '#9080B0',
    divider: '#261E3A',
    sidebarBg: '#0C0A12',
    sidebarText: '#DDD5EE',
    sidebarMuted: 'rgba(221,213,238,0.45)',
    sidebarActiveBackground: 'rgba(255,255,255,0.06)',
    sidebarDivider: 'rgba(255,255,255,0.05)',
  },
  navyDark: {
    pair: 'navy',
    isDark: true,
    particle: 'dot',
    surfaceVariant: '#161B2E',
    primary: '#7B8EB8',
    primaryLight: '#9BAED8',
    primaryDark: '#6B7EA8',
    primaryContrast: '#FFFFFF',
    secondary: '#5A6880',
    secondaryLight: '#7A88A0',
    secondaryDark: '#3A4860',
    secondaryContrast: '#FFFFFF',
    bgDefault: '#0E1018',
    bgPaper: '#131620',
    textPrimary: '#D6DBE6',
    textSecondary: '#7A8098',
    divider: '#1E2235',
    sidebarBg: '#090B12',
    sidebarText: '#D6DBE6',
    sidebarMuted: 'rgba(214,219,230,0.45)',
    sidebarActiveBackground: 'rgba(255,255,255,0.06)',
    sidebarDivider: 'rgba(255,255,255,0.05)',
  },
  ink: {
    pair: 'inkLight',
    isDark: true,
    particle: 'ember',
    surfaceVariant: '#21252D',
    primary: '#C97B5C',
    primaryLight: '#E0A688',
    primaryDark: '#B36A4D',
    primaryContrast: '#FFFFFF',
    secondary: '#6B6860',
    secondaryLight: '#8B8880',
    secondaryDark: '#4B4840',
    secondaryContrast: '#FFFFFF',
    bgDefault: '#14161B',
    bgPaper: '#1B1E25',
    textPrimary: '#E8E3DA',
    textSecondary: '#8E8B85',
    divider: '#2A2E37',
    sidebarBg: '#0E1014',
    sidebarText: '#DDD7CE',
    sidebarMuted: 'rgba(221,215,206,0.45)',
    sidebarActiveBackground: 'rgba(255,255,255,0.06)',
    sidebarDivider: 'rgba(255,255,255,0.05)',
  },
}

/**
 * Отображаемые названия тем.
 */
const THEME_NAMES: Record<ThemeVariant, string> = {
  sageLibrary: 'Sage Library',
  linen: 'Linen',
  slate: 'Slate',
  dustyPlum: 'Dusty Plum',
  navy: 'Navy',
  inkLight: 'Ink',
  sageDark: 'Sage Library',
  dune: 'Linen',
  slateDark: 'Slate',
  plumDark: 'Dusty Plum',
  navyDark: 'Navy',
  ink: 'Ink',
}

/**
 * Метаданные тем для UI выбора темы — выводятся из THEME_COLORS.
 */
export const THEMES_META = (Object.keys(THEME_COLORS) as ThemeVariant[]).map((variant) => ({
  variant,
  name: THEME_NAMES[variant],
  sidebarColor: THEME_COLORS[variant].sidebarBg,
  primaryColor: THEME_COLORS[variant].primary,
  bgColor: THEME_COLORS[variant].bgDefault,
  isDark: THEME_COLORS[variant].isDark ?? false,
}))

/** Метаданные только светлых тем. */
export const LIGHT_THEMES = THEMES_META.filter((t) => !t.isDark)

/** Метаданные только тёмных тем. */
export const DARK_THEMES = THEMES_META.filter((t) => t.isDark)
