import { Box, IconButton, List, Typography } from '@mui/material'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import RssFeedOutlinedIcon from '@mui/icons-material/RssFeedOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Link, useMatch } from 'react-router'
import type { SvgIconComponent } from '@mui/icons-material'
import { sidebarColors as c } from '@/app/styles/theme'

interface NavItemConfig {
  to: string
  icon: SvgIconComponent
  label: string
}

const NAV_ITEMS: NavItemConfig[] = [
  { to: '/profile',  icon: AccountCircleOutlinedIcon, label: 'Профиль' },
  { to: '/library',  icon: AutoStoriesOutlinedIcon,   label: 'Библиотека' },
  { to: '/feed',     icon: RssFeedOutlinedIcon,       label: 'Лента' },
  { to: '/friends',  icon: PeopleOutlinedIcon,        label: 'Друзья' },
  { to: '/search',   icon: SearchOutlinedIcon,        label: 'Поиск' },
]

const FOOTER_ITEMS: NavItemConfig[] = [
  { to: '/settings', icon: SettingsOutlinedIcon, label: 'Настройки' },
]

interface NavItemProps extends NavItemConfig {
  collapsed: boolean
}

const NavItem = ({ to, icon: Icon, label, collapsed }: NavItemProps) => {
  const isActive = !!useMatch(to)

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
        color: isActive ? c.text : c.muted,
        bgcolor: isActive ? c.activeBg : 'transparent',
        justifyContent: collapsed ? 'center' : 'flex-start',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.15s, color 0.15s',
        '&:hover': { bgcolor: c.activeBg, color: c.text },
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

interface Props {
  collapsed: boolean
  onToggle: () => void
}

/**
 * Боковое меню приложения
 */
export const Sidebar = ({ collapsed, onToggle }: Props) => (
  <Box sx={{ height: '100%', bgcolor: c.bg, color: c.text, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    {/* Шапка: логотип + кнопка сворачивания */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        px: 2,
        pt: '18px',
        pb: '14px',
        borderBottom: `1px solid ${c.divider}`,
        flexShrink: 0,
      }}
    >
      {!collapsed && (
        <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: c.text, userSelect: 'none' }}>
          Treqio
        </Typography>
      )}
      <IconButton
        onClick={onToggle}
        size="small"
        sx={{
          color: c.muted,
          borderRadius: '6px',
          bgcolor: 'rgba(255,255,255,0.05)',
          '&:hover': { bgcolor: c.activeBg, color: c.text },
        }}
      >
        {collapsed ? <ChevronRightIcon sx={{ fontSize: 20 }} /> : <ChevronLeftIcon sx={{ fontSize: 20 }} />}
      </IconButton>
    </Box>

    {/* Основная навигация */}
    <Box sx={{ flex: 1, px: 1, py: '12px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'stretch' }}>
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.to} {...item} collapsed={collapsed} />
      ))}
    </Box>

    {/* Футер: настройки и профиль */}
    <List disablePadding sx={{ px: 1, py: '12px', borderTop: `1px solid ${c.divider}`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {FOOTER_ITEMS.map((item) => (
        <NavItem key={item.to} {...item} collapsed={collapsed} />
      ))}
    </List>
  </Box>
)
