import { Box, Paper } from '@mui/material'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import RssFeedOutlinedIcon from '@mui/icons-material/RssFeedOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { useNavigate, useLocation } from 'react-router'
import type { SvgIconComponent } from '@mui/icons-material'

const NAV_ITEMS: { to: string; icon: SvgIconComponent; label: string }[] = [
  { to: '/', icon: HomeOutlinedIcon, label: 'Главная' },
  { to: '/profile', icon: AccountCircleOutlinedIcon, label: 'Профиль' },
  { to: '/library', icon: AutoStoriesOutlinedIcon, label: 'Библиотека' },
  { to: '/feed', icon: RssFeedOutlinedIcon, label: 'Лента' },
  { to: '/search', icon: SearchOutlinedIcon, label: 'Поиск' },
]

/**
 * Нижняя навигация для мобильных устройств
 */
export const MobileNav = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Box sx={{ display: 'flex', height: 56, bgcolor: 'background.paper' }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          // Для "/" нужно точное совпадение, иначе будет активен на всех страницах
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <Box
              key={to}
              onClick={() => navigate(to)}
              aria-label={label}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
              }}
            >
              <Icon
                sx={{
                  fontSize: 24,
                  color: isActive ? 'primary.main' : 'action.disabled',
                  transition: 'color 0.15s',
                }}
              />
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}
