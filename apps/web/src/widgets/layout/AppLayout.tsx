import { useState } from 'react'
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material'
import { Outlet } from 'react-router'
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
          // Отступ снизу на мобильном чтобы контент не перекрывался нижней навигацией
          pb: isMobile ? '56px' : 0,
        }}
      >
        <Outlet />
      </Box>

      {isMobile && <MobileNav />}
    </Box>
  )
}
