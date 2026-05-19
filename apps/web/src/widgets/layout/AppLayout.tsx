import { useState } from 'react'
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material'
import { Outlet } from 'react-router'
import { useAppSelector } from '@/shared/lib/store'
import { THEME_COLORS } from '@/shared/config/themes'
import { ParticleCanvas } from '@/features/animations'
import { GuestBanner } from '@/features/guest'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export const SIDEBAR_WIDTH = 220
export const SIDEBAR_COLLAPSED_WIDTH = 64

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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            transition: 'width 0.2s ease',
            '& .MuiDrawer-paper': {
              width: sidebarWidth,
              border: 'none',
              overflowX: 'hidden',
              transition: 'width 0.2s ease',
            },
          }}
        >
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          minWidth: 0,
          position: 'relative',
          pb: isMobile ? '56px' : 0,
        }}
      >
        {showParticles && <ParticleCanvas type={particleType!} />}
        <GuestBanner />
        <Outlet />
      </Box>

      {isMobile && <MobileNav />}
    </Box>
  )
}
