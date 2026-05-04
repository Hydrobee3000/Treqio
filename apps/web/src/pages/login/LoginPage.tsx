import { Box, Button, Typography } from '@mui/material'

const API_URL = import.meta.env['VITE_API_URL'] as string

/**
 * Страница входа в приложение.
 */
export function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 3,
      }}
    >
      <Typography variant="h4">Treqio</Typography>
      <Button variant="contained" size="large" onClick={handleGoogleLogin}>
        Войти через Google
      </Button>
    </Box>
  )
}
