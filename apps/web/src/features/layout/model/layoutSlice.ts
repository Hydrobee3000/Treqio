import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_LAYOUT } from '@/shared/config/layout'
import type { LayoutVariant } from '@/shared/config/layout'

const STORAGE_KEY = 'treqio_layout'

/**
 * Состояние вида представления домашней страницы.
 */
interface LayoutState {
  /** Текущий вид: сетка или bento. */
  variant: LayoutVariant
}

/** Начальное состояние — читаем из localStorage, иначе дефолт. */
const initialState: LayoutState = {
  variant: (localStorage.getItem(STORAGE_KEY) as LayoutVariant | null) ?? DEFAULT_LAYOUT,
}

/**
 * Slice управления видом представления домашней страницы.
 */
const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    /**
     * Смена вида представления. Сохраняет выбор в localStorage.
     */
    setLayout: (state, action: PayloadAction<LayoutVariant>) => {
      state.variant = action.payload
      localStorage.setItem(STORAGE_KEY, action.payload)
    },
  },
})

export const { setLayout } = layoutSlice.actions
export default layoutSlice.reducer
