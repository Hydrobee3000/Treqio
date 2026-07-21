import { Box, Paper } from '@mui/material'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { useNavigate, useLocation } from 'react-router'
import type { SvgIconComponent } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import styles from './MobileNav.module.scss'

/**
 * Нижняя навигация для мобильных устройств.
 */
export const MobileNav = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  /** Конфигурация пункта нижней навигации. */
  const navItems: { to: string; icon: SvgIconComponent; label: string }[] = [
    { to: '/', icon: HomeOutlinedIcon, label: t('nav.home') },
    { to: '/profile', icon: AccountCircleOutlinedIcon, label: t('nav.profile') },
    { to: '/library', icon: AutoStoriesOutlinedIcon, label: t('nav.library') },
    { to: '/settings', icon: SettingsOutlinedIcon, label: t('nav.settings') },
  ]

  return (
    <Paper
      elevation={0}
      square
      className={styles['mobile-nav']}
      sx={{ zIndex: (theme) => theme.zIndex.appBar }}
    >
      <Box className={styles['mobile-nav__items']}>
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)

          return (
            <Box
              key={to}
              onClick={() => navigate(to)}
              aria-label={label}
              className={styles['mobile-nav__item']}
            >
              <span
                className={`${styles['mobile-nav__icon-wrap']} ${isActive ? styles['mobile-nav__icon-wrap--active'] : ''}`}
              >
                <Icon className={styles['mobile-nav__icon']} />
              </span>
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}
