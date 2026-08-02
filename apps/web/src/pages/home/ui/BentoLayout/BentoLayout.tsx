import { LogIn } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import type { TileKey } from '../../model/useTiles'
import { useTiles } from '../../model/useTiles'
import { BentoCellButton } from './BentoCellButton'
import styles from './BentoLayout.module.scss'

/** Свойства BentoLayout. */
interface Props {
  /** Флаг гостевого режима. */
  isGuest: boolean
}

/**
 * Bento-раскладка.
 */
export function BentoLayout({ isGuest }: Props) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const tiles = useTiles()
  const getTile = (key: TileKey) => tiles.find((tile) => tile.key === key)!
  const books = getTile('books')
  const theme = getTile('theme')
  const profile = getTile('profile')
  const language = getTile('language')

  return (
    <div className={styles['bento']}>
      <BentoCellButton
        variant="hero"
        icon={books.icon}
        title={books.title}
        desc={books.desc}
        onClick={() => navigate(books.href)}
      />

      <BentoCellButton
        variant="dark"
        icon={theme.icon}
        title={theme.title}
        desc={theme.desc}
        onClick={() => navigate(theme.href)}
      />

      <BentoCellButton
        icon={profile.icon}
        title={profile.title}
        desc={profile.desc}
        onClick={() => navigate(profile.href)}
      />

      <BentoCellButton
        icon={language.icon}
        title={language.title}
        desc={language.desc}
        onClick={() => navigate(language.href)}
      />

      {/* Для гостя - дополнительная плитка с подсказкой 'войти' */}
      {isGuest && (
        <BentoCellButton
          variant="dark"
          icon={<LogIn size={22} />}
          title={t('home.cards.login.title')}
          desc={t('home.cards.login.desc')}
          onClick={() => navigate('/login')}
        />
      )}
    </div>
  )
}
