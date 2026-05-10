import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import RssFeedOutlinedIcon from '@mui/icons-material/RssFeedOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import { Box, IconButton, List, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Link, useMatch } from 'react-router'

/**
 * Конфигурация пункта навигации.
 */
interface NavItemConfig {
  /** Путь роута. */
  to: string
  /** Иконка MUI. */
  icon: SvgIconComponent
  /** Подпись пункта меню. */
  label: string
}

/**
 * Основные пункты навигации.
 */
const NAV_ITEMS: NavItemConfig[] = [
  { to: '/', icon: HomeOutlinedIcon, label: 'Главная' },
  { to: '/profile', icon: AccountCircleOutlinedIcon, label: 'Профиль' },
  { to: '/library', icon: AutoStoriesOutlinedIcon, label: 'Библиотека' },
  { to: '/feed', icon: RssFeedOutlinedIcon, label: 'Лента' },
  { to: '/friends', icon: PeopleOutlinedIcon, label: 'Друзья' },
  { to: '/search', icon: SearchOutlinedIcon, label: 'Поиск' },
]

/**
 * Пункты в подвале сайдбара.
 */
const FOOTER_ITEMS: NavItemConfig[] = [
  { to: '/settings', icon: SettingsOutlinedIcon, label: 'Настройки' },
]

/**
 * Свойства пункта навигации с состоянием сайдбара.
 */
interface NavItemProps extends NavItemConfig {
  /** Флаг свёрнутости сайдбара. */
  collapsed: boolean
}

const NavItem = ({ to, icon: Icon, label, collapsed }: NavItemProps) => {
  const isActive = !!useMatch(to)
  const { palette } = useTheme()
  const sidebar = palette.sidebar

  return (
    <Box
      component={Link}
      to={to}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        px: '10px',
        py: '8px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: isActive ? sidebar.text : sidebar.muted,
        bgcolor: isActive ? sidebar.activeBackground : 'transparent',
        justifyContent: collapsed ? 'center' : 'flex-start',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.15s, color 0.15s',
        '&:hover': { bgcolor: sidebar.activeBackground, color: sidebar.text },
      }}
    >
      <Icon sx={{ fontSize: 22, flexShrink: 0 }} />
      {!collapsed && (
        <Typography sx={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', color: 'inherit' }}>
          {label}
        </Typography>
      )}
    </Box>
  )
}

/**
 * Свойства сайдбара.
 */
interface Props {
  /** Флаг свёрнутости сайдбара. */
  collapsed: boolean
  /** Функция переключения состояния свёрнутости. */
  onToggle: () => void
}

/**
 * Боковое меню приложения.
 */
export const Sidebar = ({ collapsed, onToggle }: Props) => {
  const { palette } = useTheme()
  const sidebar = palette.sidebar

  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: sidebar.background,
        color: sidebar.text,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Шапка: логотип + кнопка сворачивания */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: 2,
          pt: '18px',
          pb: '14px',
          borderBottom: `1px solid ${sidebar.divider}`,
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <Typography
            sx={{
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: sidebar.text,
              userSelect: 'none',
            }}
          >
            Treqio
          </Typography>
        )}
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            color: sidebar.muted,
            borderRadius: '6px',
            bgcolor: 'rgba(255,255,255,0.05)',
            '&:hover': { bgcolor: sidebar.activeBackground, color: sidebar.text },
          }}
        >
          {collapsed ? (
            <ChevronRightIcon sx={{ fontSize: 20 }} />
          ) : (
            <ChevronLeftIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>
      </Box>

      {/* Основная навигация */}
      <Box
        sx={{
          flex: 1,
          px: 1,
          py: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: 'stretch',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </Box>

      {/* Футер: настройки */}
      <List
        disablePadding
        sx={{
          px: 1,
          py: '12px',
          borderTop: `1px solid ${sidebar.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {FOOTER_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </List>
    </Box>
  )
}
