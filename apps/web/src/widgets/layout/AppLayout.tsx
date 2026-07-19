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
 * Заглушка на время загрузки лениво подгружаемой страницы внутри layout —
 * сайдбар остаётся на месте, крутится только контентная область.
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
    <Box className={styles['app-layout']}>
      {!isMobile && (
        <Drawer
          variant="permanent"
          className={styles['app-layout__drawer']}
          style={{ '--sidebar-width': `${sidebarWidth}px` } as CSSProperties}
        >
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        </Drawer>
      )}

      <Box
        component="main"
        className={`${styles['app-layout__main']} ${isMobile ? styles['app-layout__main--mobile'] : ''}`}
      >
        {showParticles && <ParticleCanvas type={particleType!} />}
        <GuestBanner />
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Box>

      {isMobile && <MobileNav />}
    </Box>
  )
}
