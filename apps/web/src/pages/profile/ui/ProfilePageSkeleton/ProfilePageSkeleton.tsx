import { BarChart3, History } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProfileHeaderSkeleton } from '@/widgets/profile-header'
import { HistorySkeleton } from '../HistorySkeleton/HistorySkeleton'
import styles from './ProfilePageSkeleton.module.scss'

/**
 * Заглушка страницы профиля на время загрузки — шапка, статичные табы и
 * таймлайн истории. Табы упрощены (без «Друзья» и переключения), т.к. до
 * загрузки данных активная вкладка всегда «История».
 */
export function ProfilePageSkeleton() {
  const { t } = useTranslation()

  return (
    <div className={styles['profile']}>
      <ProfileHeaderSkeleton actionWidth={76} />

      <div className={styles['tabs']}>
        <button className={`${styles['tab']} ${styles['tab--active']}`}>
          <History size={17} />
          {t('profile.tabs.history')}
        </button>
        <button className={styles['tab']}>
          <BarChart3 size={17} />
          {t('profile.tabs.stats')}
        </button>
      </div>

      <HistorySkeleton />
    </div>
  )
}
