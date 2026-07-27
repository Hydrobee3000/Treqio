import { useState } from 'react'
import { LogIn, Search, SearchX, Users, X } from 'lucide-react'
import { Skeleton, Tooltip } from '@mui/material'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useSearchUsersQuery } from '@/features/user'
import { USERNAME_MAX } from '@/features/user/api/constraints'
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue'
import { saveRedirectPath } from '@/shared/lib/redirectPath'
import { useAppSelector } from '@/shared/lib/store'
import styles from './SearchPage.module.scss'

/** Минимальная длина запроса — совпадает с ограничением на backend. */
const QUERY_MIN_LENGTH = 2

/** Задержка перед запросом, чтобы не дёргать сервер на каждый символ. */
const SEARCH_DEBOUNCE_MS = 350

/**
 * Страница поиска людей.
 */
export const SearchPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isGuest = useAppSelector((s) => s.auth.isGuest)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS)

  const isQueryReady = debouncedQuery.length >= QUERY_MIN_LENGTH
  const { data: users, isFetching } = useSearchUsersQuery(debouncedQuery, {
    skip: !isQueryReady || isGuest,
  })

  const results = users ?? []

  /** Сохраняет текущий путь и ведёт на страницу входа. */
  const handleGoToLogin = () => {
    saveRedirectPath('/search')
    void navigate('/login')
  }

  // Гостю сервер данных не отдаёт — вместо пустой выдачи объясняем причину.
  if (isGuest) {
    return (
      <div className={styles['search']}>
        <div className={styles['search__header']}>
          <h1 className={styles['search__title']}>{t('search.title')}</h1>
        </div>
        <div className={styles['empty-state']}>
          <div className={styles['empty-state__icon']}>
            <Users size={48} />
          </div>
          <p className={styles['empty-state__text']}>{t('search.guest.title')}</p>
          <p className={styles['empty-state__sub']}>{t('search.guest.desc')}</p>
          <button className={styles['empty-state__cta']} onClick={handleGoToLogin}>
            <LogIn size={16} />
            {t('search.guest.login')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles['search']}>
      <div className={styles['search__header']}>
        <h1 className={styles['search__title']}>{t('search.title')}</h1>
      </div>

      <div className={styles['search__field-row']}>
        <div className={styles['search__field']}>
          <Search size={16} className={query ? styles['search__icon--active'] : undefined} />
          <input
            className={styles['search__input']}
            type="text"
            placeholder={t('search.placeholder')}
            value={query}
            maxLength={USERNAME_MAX}
            autoFocus
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <Tooltip title={t('search.clear')}>
              <button className={styles['search__clear']} onClick={() => setQuery('')}>
                <X size={14} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {!isQueryReady ? (
        <div className={styles['empty-state']}>
          <div className={styles['empty-state__icon']}>
            <Users size={48} />
          </div>
          <p className={styles['empty-state__text']}>{t('search.hint.title')}</p>
          <p className={styles['empty-state__sub']}>
            {t('search.hint.desc', { min: QUERY_MIN_LENGTH })}
          </p>
        </div>
      ) : isFetching ? (
        <div className={styles['search__results']}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles['user-row']}>
              <Skeleton variant="circular" width={44} height={44} sx={{ flexShrink: 0 }} />
              <div className={styles['user-row__info']}>
                <Skeleton variant="text" width={150} sx={{ fontSize: '15px' }} />
                <Skeleton variant="text" width={90} sx={{ fontSize: '13px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className={styles['empty-state']}>
          <div className={styles['empty-state__icon']}>
            <SearchX size={48} />
          </div>
          <p className={styles['empty-state__text']}>
            {t('search.noResults.title', { query: debouncedQuery })}
          </p>
          <p className={styles['empty-state__sub']}>{t('search.noResults.desc')}</p>
        </div>
      ) : (
        <div className={styles['search__results']}>
          {results.map((user) => {
            const name = user.displayName || user.username || t('profile.defaultName')
            return (
              <Link key={user.id} to={`/${user.username}`} className={styles['user-row']}>
                <div className={styles['user-row__avatar']}>{name.charAt(0).toUpperCase()}</div>
                <div className={styles['user-row__info']}>
                  <span className={styles['user-row__name']}>{name}</span>
                  {user.username && (
                    <span className={styles['user-row__username']}>@{user.username}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
