import { Children, cloneElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import styles from './UnderConstruction.module.scss'

/**
 * Свойства UnderConstruction.
 */
interface Props {
  /** Единственный оборачиваемый элемент - кнопка, карточка и т.д.
   *  Должен иметь position: relative (и желательно overflow: hidden),
   *  чтобы лента корректно располагалась и клипалась по краю. */
  children: ReactElement<{ className?: string; children?: ReactNode }>
}

/**
 * Помечает обёрнутый элемент как недоступный функционал "в разработке" -
 * добавляет ленту ограждения и затемняет (обесцвечивает) карточку целиком,
 * включая её фон. Класс навешивается прямо на переданный элемент (через
 * cloneElement), без обёртки в DOM, поэтому не влияет на layout родителя
 * (grid/flex). Вуаль и лента — настоящие дочерние элементы, а не
 * ::before/::after, чтобы не конфликтовать с собственными псевдоэлементами
 * оборачиваемой карточки (анимации, hover-эффекты и т.д.). Размеры ленты
 * заданы в % и em, поэтому масштабируются вместе с размером самого элемента.
 */
export const UnderConstruction = ({ children }: Props) => {
  const child = Children.only(children)

  return cloneElement(
    child,
    {
      className: `${child.props.className ?? ''} ${styles['under-construction']}`.trim(),
    },
    <>
      {child.props.children}
      <span className={styles['under-construction__veil']} aria-hidden="true" />
      <span className={styles['under-construction__ribbon']} aria-hidden="true" />
    </>,
  )
}
