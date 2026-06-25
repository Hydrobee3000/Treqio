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
import { useAppDispatch, useAppSelector } from '@/shared/lib/store'
import { toggleDark } from '@/features/theme'
import styles from './Sidebar.module.scss'

/**
 * Конфигурация пункта навигации.
 */
interface NavItemConfig {
  to: string
  icon: SvgIconComponent
  label: string
  /** Раздел еще не реализован — пункт виден, но недоступен для перехода. */
  disabled?: boolean
}

const NAV_ITEMS: NavItemConfig[] = [
  { to: '/', icon: HomeOutlinedIcon, label: 'Главная' },
  { to: '/profile', icon: AccountCircleOutlinedIcon, label: 'Профиль' },
  { to: '/library', icon: AutoStoriesOutlinedIcon, label: 'Библиотека' },
  { to: '/feed', icon: RssFeedOutlinedIcon, label: 'Лента', disabled: true },
  { to: '/friends', icon: PeopleOutlinedIcon, label: 'Друзья', disabled: true },
  { to: '/search', icon: SearchOutlinedIcon, label: 'Поиск', disabled: true },
]

const FOOTER_ITEMS: NavItemConfig[] = [
  { to: '/settings', icon: SettingsOutlinedIcon, label: 'Настройки' },
]

interface NavItemProps extends NavItemConfig {
  collapsed: boolean
}

const NavItem = ({ to, icon: Icon, label, collapsed, disabled }: NavItemProps) => {
  const isActive = !!useMatch({ path: to, end: to === '/' })

  if (disabled) {
    return (
      <Tooltip title="Скоро" placement="right">
        <span
          className={`${styles['nav-item']} ${styles['nav-item--disabled']} ${collapsed ? styles['nav-item--collapsed'] : ''}`}
        >
          <Icon style={{ fontSize: 22, flexShrink: 0 }} />
          {!collapsed && <span className={styles['nav-item__label']}>{label}</span>}
        </span>
      </Tooltip>
    )
  }

  return (
    <Link
      to={to}
      className={`${styles['nav-item']} ${isActive ? styles['nav-item--active'] : ''} ${collapsed ? styles['nav-item--collapsed'] : ''}`}
    >
      <Icon style={{ fontSize: 22, flexShrink: 0 }} />
      {!collapsed && <span className={styles['nav-item__label']}>{label}</span>}
    </Link>
  )
}

/**
 * Свойства сайдбара.
 */
interface Props {
  collapsed: boolean
  onToggle: () => void
}

/**
 * Боковое меню приложения.
 */
export const Sidebar = ({ collapsed, onToggle }: Props) => {
  const dispatch = useAppDispatch()
  const isDark = useAppSelector((s) => s.theme.isDark)

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
        <button className={styles['sidebar__collapse-btn']} onClick={onToggle}>
          {collapsed ? (
            <ChevronRightIcon style={{ fontSize: 20 }} />
          ) : (
            <ChevronLeftIcon style={{ fontSize: 20 }} />
          )}
        </button>
      </div>

      <nav className={styles['sidebar__nav']}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className={styles['sidebar__footer']}>
        <Tooltip title={isDark ? 'Светлая тема' : 'Тёмная тема'} placement="right">
          <button
            className={`${styles['theme-toggle']} ${collapsed ? styles['theme-toggle--collapsed'] : ''}`}
            onClick={() => dispatch(toggleDark())}
          >
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
            {!collapsed && (
              <span className={styles['theme-toggle__label']}>
                {isDark ? 'Светлая тема' : 'Тёмная тема'}
              </span>
            )}
          </button>
        </Tooltip>

        {FOOTER_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  )
}
