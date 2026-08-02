import { useNavigate } from 'react-router'
import { useTiles } from '../../model/useTiles'
import { GridTileButton } from './GridTileButton'
import styles from './GridLayout.module.scss'

/**
 * Сетка 2×2.
 */
export function GridLayout() {
  const navigate = useNavigate()
  const tiles = useTiles()

  return (
    <div className={styles['grid']}>
      {tiles.map((tile) => (
        <GridTileButton
          key={tile.key}
          icon={tile.icon}
          title={tile.title}
          desc={tile.desc}
          onClick={() => navigate(tile.href)}
        />
      ))}
    </div>
  )
}
