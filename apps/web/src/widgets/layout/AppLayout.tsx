import { useState } from 'react'
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material'
import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'

export const SIDEBAR_WIDTH = 220
export const SIDEBAR_COLLAPSED_WIDTH = 64

/**
 * Layout приложения: сайдбар слева + контент справа.
 * Используется как родительский маршрут в роутере — состояние collapsed
 * сохраняется при навигации между страницами.
 */
export const AppLayout = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, border: 'none' } }}
        >
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </Drawer>
      ) : (
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

      <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  )
}
