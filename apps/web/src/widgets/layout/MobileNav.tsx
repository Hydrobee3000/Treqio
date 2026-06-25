import { Box, Paper } from '@mui/material'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import RssFeedOutlinedIcon from '@mui/icons-material/RssFeedOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import { useNavigate, useLocation } from 'react-router'
import type { SvgIconComponent } from '@mui/icons-material'
import styles from './MobileNav.module.scss'

/** Раздел еще не реализован — пункт виден, но недоступен для перехода. */
const NAV_ITEMS: { to: string; icon: SvgIconComponent; label: string; disabled?: boolean }[] = [
  { to: '/', icon: HomeOutlinedIcon, label: 'Главная' },
  { to: '/profile', icon: AccountCircleOutlinedIcon, label: 'Профиль' },
  { to: '/library', icon: AutoStoriesOutlinedIcon, label: 'Библиотека' },
  { to: '/feed', icon: RssFeedOutlinedIcon, label: 'Лента', disabled: true },
  { to: '/search', icon: SearchOutlinedIcon, label: 'Поиск', disabled: true },
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
      square
      className={styles['mobile-nav']}
      sx={{ zIndex: (theme) => theme.zIndex.appBar }}
    >
      <Box className={styles['mobile-nav__items']}>
        {NAV_ITEMS.map(({ to, icon: Icon, label, disabled }) => {
          // Для "/" нужно точное совпадение, иначе будет активен на всех страницах
          const isActive = !disabled && (to === '/' ? pathname === '/' : pathname.startsWith(to))
          return (
            <Box
              key={to}
              onClick={() => !disabled && navigate(to)}
              aria-label={label}
              aria-disabled={disabled}
              className={`${styles['mobile-nav__item']} ${disabled ? styles['mobile-nav__item--disabled'] : ''}`}
            >
              <Icon
                className={`${styles['mobile-nav__icon']} ${isActive ? styles['mobile-nav__icon--active'] : ''} ${disabled ? styles['mobile-nav__icon--disabled'] : ''}`}
              />
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}
