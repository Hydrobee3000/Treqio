import { Suspense, useState } from 'react'
import type { CSSProperties } from 'react'
import { Box, CircularProgress, Drawer, useMediaQuery, useTheme } from '@mui/material'
import { Outlet } from 'react-router'
import { useAppSelector } from '@/shared/lib/store'
import { THEME_COLORS } from '@/shared/config/themes'
import { ParticleCanvas } from '@/features/animations'
import { GuestBanner } from '@/features/guest'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import styles from './AppLayout.module.scss'

export const SIDEBAR_WIDTH = 220
export const SIDEBAR_COLLAPSED_WIDTH = 64

/**
 * Заглушка на время загрузки лениво подгружаемой страницы
 */
function PageLoader() {
  return (
    <Box className={styles['app-layout__page-loader']}>
      <CircularProgress />
    </Box>
  )
}

/**
 * Layout приложения: сайдбар слева + контент справа.
 * На мобильном сайдбар заменяется нижней навигацией.
 */
export const AppLayout = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [collapsed, setCollapsed] = useState(false)

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  const { lightVariant, darkVariant, isDark } = useAppSelector((s) => s.theme)
  const activeVariant = isDark ? darkVariant : lightVariant
  const particlesEnabled = useAppSelector((s) => s.animations.particlesEnabled)
  const particleType = THEME_COLORS[activeVariant].particle
  const showParticles = particlesEnabled && !!particleType

  return (
    <Box
      className={styles['app-layout']}
      // На корне layout, а не только на Drawer — доступна остальному дереву
      // (например модалкам, которым нужно центрироваться в области контента).
      style={{ '--sidebar-width': isMobile ? '0px' : `${sidebarWidth}px` } as CSSProperties}
    >
      {!isMobile && (
        <Drawer variant="permanent" className={styles['app-layout__drawer']}>
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        </Drawer>
      )}

      <Box
        component="main"
        className={`${styles['app-layout__main']} ${isMobile ? styles['app-layout__main--mobile'] : ''}`}
      >
        {showParticles && <ParticleCanvas type={particleType!} />}
        <GuestBanner />
        <Box className={styles['app-layout__content']}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>

      {isMobile && <MobileNav />}
    </Box>
  )
}
