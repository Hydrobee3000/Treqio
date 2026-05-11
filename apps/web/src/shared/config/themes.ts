/**
 * Доступные варианты темы приложения.
 */
export type ThemeVariant = 'sageLibrary' | 'warmLatte' | 'slate' | 'dustyPlum'

/** Дефолтная тема приложения. */
export const DEFAULT_THEME: ThemeVariant = 'sageLibrary'

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
}

/**
 * Цветовые токены всех тем.
 */
export const THEME_COLORS: Record<ThemeVariant, ThemeColors> = {
  sageLibrary: {
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
  warmLatte: {
    primary: '#8B5E3C',
    primaryLight: '#A87D5A',
    primaryDark: '#7A5234',
    primaryContrast: '#FFF8F2',
    secondary: '#7A5C45',
    secondaryLight: '#9A7A62',
    secondaryDark: '#5E4432',
    secondaryContrast: '#FFF8F2',
    bgDefault: '#FAF6F0',
    bgPaper: '#FFF8F2',
    textPrimary: '#2C1810',
    textSecondary: '#7A5C45',
    divider: '#E8DDD0',
    sidebarBg: '#2C1810',
    sidebarText: '#E8DDD0',
    sidebarMuted: 'rgba(232,221,208,0.5)',
    sidebarActiveBackground: 'rgba(255,255,255,0.10)',
    sidebarDivider: 'rgba(255,255,255,0.07)',
  },
  slate: {
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
}

/**
 * Отображаемые названия тем.
 */
const THEME_NAMES: Record<ThemeVariant, string> = {
  sageLibrary: 'Sage Library',
  warmLatte: 'Warm Latte',
  slate: 'Slate',
  dustyPlum: 'Dusty Plum',
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
}))
