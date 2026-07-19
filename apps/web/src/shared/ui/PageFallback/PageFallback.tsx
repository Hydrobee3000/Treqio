import { Box, CircularProgress } from '@mui/material'
import styles from './PageFallback.module.scss'

/**
 * Заглушка на время загрузки лениво подгружаемой страницы.
 */
export function PageFallback() {
  return (
    <Box className={styles['page-fallback']}>
      <CircularProgress />
    </Box>
  )
}
