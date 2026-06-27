import { useState } from 'react'
import { Snackbar, Alert, Button, IconButton } from '@mui/material'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAppSelector } from '@/shared/lib/store'

const DISMISSED_KEY = 'treqio_guest_banner_dismissed'

/**
 * Баннер-подсказка для гостевого режима.
 */
export const GuestBanner = () => {
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === 'true')

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  return (
    <Snackbar
      open={isGuest && !dismissed}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      slotProps={{ transition: { unmountOnExit: true } }}
    >
      <Alert
        severity="warning"
        action={
          <>
            <Button
              size="small"
              onClick={() => navigate('/login')}
              sx={{
                color: 'warning.main',
                border: '1px solid',
                borderColor: 'warning.main',
                borderRadius: 1,
                px: 1.5,
              }}
            >
              Войти
            </Button>
            <IconButton
              size="small"
              color="inherit"
              aria-label="Закрыть"
              onClick={handleDismiss}
              sx={{ ml: 1 }}
            >
              <X size={16} />
            </IconButton>
          </>
        }
        sx={{ backdropFilter: 'blur(8px)', backgroundColor: 'var(--color-warning-bg)' }}
      >
        Данные хранятся только в браузере
      </Alert>
    </Snackbar>
  )
}
