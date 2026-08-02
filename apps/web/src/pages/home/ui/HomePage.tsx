import { LayoutGrid, PanelTop } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { setLayout } from '@/features/layout'
import type { LayoutVariant } from '@/shared/config/layout'
import { SegmentedToggle } from '@/shared/ui'
import { BentoLayout } from './BentoLayout/BentoLayout'
import { GridLayout } from './GridLayout/GridLayout'
import { GuestLoginCard } from './GuestLoginCard/GuestLoginCard'
import styles from './HomePage.module.scss'

/**
 * Домашняя страница — точка входа для авторизованного пользователя.
 */
export function HomePage() {
  const dispatch = useAppDispatch()
  const layout = useAppSelector((s) => s.layout.variant)
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const { t } = useTranslation()

  const handleLayoutChange = (variant: LayoutVariant) => {
    dispatch(setLayout(variant))
  }

  return (
    <div className={styles['home']}>
      <div className={styles['home__header']}>
        <h1 className={styles['home__title']}>{t('home.title')}</h1>
      </div>
      <div className={styles['home__label-row']}>
        <span className={styles['home__label']}>{t('home.quickActions')}</span>
        <div className={styles['home__label-row-end']}>
          <span className={styles['home__version']}>v{__APP_VERSION__}</span>
          {/* Переключатель вида */}
          <SegmentedToggle
            value={layout}
            onChange={handleLayoutChange}
            options={[
              { value: 'grid', icon: <LayoutGrid size={16} />, tooltip: t('home.layoutGrid') },
              { value: 'bento', icon: <PanelTop size={16} />, tooltip: t('home.layoutBento') },
            ]}
          />
        </div>
      </div>

      {layout === 'grid' ? (
        <div className={styles['home__grid-section']}>
          <GridLayout />
          <div className={styles['home__spacer']} />
          {isGuest && <GuestLoginCard />}
        </div>
      ) : (
        <BentoLayout isGuest={isGuest} />
      )}
    </div>
  )
}
