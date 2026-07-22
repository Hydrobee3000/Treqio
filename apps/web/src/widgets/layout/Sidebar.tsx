import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import RssFeedOutlinedIcon from '@mui/icons-material/RssFeedOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import { Moon, Sun } from 'lucide-react'
import { Link, useMatch } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { toggleDark } from '@/features/theme'
import styles from './Sidebar.module.scss'

/**
 * Конфигурация пункта навигации.
 */
interface NavItemConfig {
  /** Путь маршрута. */
  to: string
  /** Иконка пункта. */
  icon: SvgIconComponent
  /** Метка пункта. */
  label: string
  /** Флаг недоступности — пункт виден, но не кликабелен. */
  disabled?: boolean
}

/**
 * Свойства NavItem.
 */
interface NavItemProps extends NavItemConfig {
  /** Флаг свёрнутого состояния сайдбара. */
  collapsed: boolean
}

const NavItem = ({ to, icon: Icon, label, collapsed, disabled }: NavItemProps) => {
  const { t } = useTranslation()
  const isActive = !!useMatch({ path: to, end: to === '/' })

  if (disabled) {
    return (
      <Tooltip title={t('nav.comingSoon')} placement="right">
        <span
          className={`${styles['nav-item']} ${styles['nav-item--disabled']} ${collapsed ? styles['nav-item--collapsed'] : ''}`}
        >
          <Icon style={{ fontSize: 22, flexShrink: 0 }} />
          {!collapsed && <span className={styles['nav-item__label']}>{label}</span>}
        </span>
      </Tooltip>
    )
  }

  const link = (
    <Link
      to={to}
      className={`${styles['nav-item']} ${isActive ? styles['nav-item--active'] : ''} ${collapsed ? styles['nav-item--collapsed'] : ''}`}
    >
      <Icon style={{ fontSize: 22, flexShrink: 0 }} />
      {!collapsed && <span className={styles['nav-item__label']}>{label}</span>}
    </Link>
  )

  return collapsed ? (
    <Tooltip title={label} placement="right">
      {link}
    </Tooltip>
  ) : (
    link
  )
}

/**
 * Свойства сайдбара.
 */
interface Props {
  /** Флаг свёрнутого состояния. */
  collapsed: boolean
  /** Функция переключения состояния. */
  onToggle: () => void
}

/**
 * Боковое меню приложения.
 */
export const Sidebar = ({ collapsed, onToggle }: Props) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const isDark = useAppSelector((s) => s.theme.isDark)

  const navItems: NavItemConfig[] = [
    { to: '/', icon: HomeOutlinedIcon, label: t('nav.home') },
    { to: '/profile', icon: AccountCircleOutlinedIcon, label: t('nav.profile') },
    { to: '/library', icon: AutoStoriesOutlinedIcon, label: t('nav.library') },
    { to: '/feed', icon: RssFeedOutlinedIcon, label: t('nav.feed'), disabled: true },
    { to: '/friends', icon: PeopleOutlinedIcon, label: t('nav.friends'), disabled: true },
    { to: '/search', icon: SearchOutlinedIcon, label: t('nav.search'), disabled: true },
  ]

  const footerItems: NavItemConfig[] = [
    { to: '/settings', icon: SettingsOutlinedIcon, label: t('nav.settings') },
  ]

  const themeLabel = isDark ? t('nav.lightTheme') : t('nav.darkTheme')

  return (
    <div className={styles['sidebar']}>
      <div
        className={`${styles['sidebar__header']} ${collapsed ? styles['sidebar__header--collapsed'] : ''}`}
      >
        {!collapsed && (
          <div className={styles['sidebar__brand']}>
            <span className={styles['sidebar__logo-icon']} />
            <span className={styles['sidebar__logo']}>Treqio</span>
          </div>
        )}
        <button
          className={styles['sidebar__collapse-btn']}
          onClick={onToggle}
          aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
        >
          {collapsed ? (
            <ChevronRightIcon style={{ fontSize: 20 }} />
          ) : (
            <ChevronLeftIcon style={{ fontSize: 20 }} />
          )}
        </button>
      </div>

      <nav className={styles['sidebar__nav']}>
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className={styles['sidebar__footer']}>
        {collapsed ? (
          <Tooltip title={themeLabel} placement="right">
            <button
              className={`${styles['theme-toggle']} ${styles['theme-toggle--collapsed']}`}
              onClick={() => dispatch(toggleDark())}
              aria-label={themeLabel}
            >
              {isDark ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </Tooltip>
        ) : (
          <button className={styles['theme-toggle']} onClick={() => dispatch(toggleDark())}>
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
            <span className={styles['theme-toggle__label']}>{themeLabel}</span>
          </button>
        )}

        {footerItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  )
}
