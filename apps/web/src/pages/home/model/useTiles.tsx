import type { ReactNode } from 'react'
import { BookOpen, Languages, Palette, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/** Идентификатор плитки. */
export type TileKey = 'books' | 'theme' | 'profile' | 'language'

/**
 * Плитка быстрого действия на домашней странице.
 */
export interface Tile {
  /** Стабильный идентификатор — используется вместо индекса массива. */
  key: TileKey
  /** Иконка плитки. */
  icon: ReactNode
  /** Заголовок плитки. */
  title: string
  /** Описание плитки. */
  desc: string
  /** Путь для перехода при клике. */
  href: string
}

/**
 * Плитки быстрых действий — зависят от переводов.
 */
export function useTiles(): Tile[] {
  const { t } = useTranslation()
  return [
    {
      key: 'books',
      icon: <BookOpen size={22} />,
      title: t('home.cards.addBook.title'),
      desc: t('home.cards.addBook.desc'),
      href: '/library',
    },
    {
      key: 'theme',
      icon: <Palette size={22} />,
      title: t('home.cards.theme.title'),
      desc: t('home.cards.theme.desc'),
      href: '/settings/appearance',
    },
    {
      key: 'profile',
      icon: <User size={22} />,
      title: t('home.cards.profile.title'),
      desc: t('home.cards.profile.desc'),
      href: '/profile',
    },
    {
      key: 'language',
      icon: <Languages size={22} />,
      title: t('home.cards.language.title'),
      desc: t('home.cards.language.desc'),
      href: '/settings/language',
    },
  ]
}
