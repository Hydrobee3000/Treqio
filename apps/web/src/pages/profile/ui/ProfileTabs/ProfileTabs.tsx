import { BarChart3, History, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styles from './ProfileTabs.module.scss'

/** Вкладка страницы профиля. */
export type ProfileTab = 'history' | 'stats' | 'friends'

/** Свойства ProfileTabs. */
interface Props {
  /** Активная вкладка. */
  activeTab: ProfileTab
  /** Колбэк переключения вкладки. */
  onChange: (tab: ProfileTab) => void
  /** Количество входящих заявок в друзья — счётчик на вкладке «Друзья». */
  incomingCount: number
}

/**
 * Переключатель вкладок профиля: история / друзья / статистика.
 */
export function ProfileTabs({ activeTab, onChange, incomingCount }: Props) {
  const { t } = useTranslation()

  return (
    <div className={styles['tabs']}>
      <button
        className={`${styles['tab']} ${activeTab === 'history' ? styles['tab--active'] : ''}`}
        onClick={() => onChange('history')}
      >
        <History size={17} />
        {t('profile.tabs.history')}
      </button>
      <button
        className={`${styles['tab']} ${activeTab === 'friends' ? styles['tab--active'] : ''}`}
        onClick={() => onChange('friends')}
      >
        <Users size={17} />
        {t('profile.tabs.friends')}
        {incomingCount > 0 && <span className={styles['tab__badge']}>{incomingCount}</span>}
      </button>
      <button
        className={`${styles['tab']} ${activeTab === 'stats' ? styles['tab--active'] : ''}`}
        onClick={() => onChange('stats')}
      >
        <BarChart3 size={17} />
        {t('profile.tabs.stats')}
      </button>
    </div>
  )
}
