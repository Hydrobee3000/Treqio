import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

const STORAGE_KEY = 'treqio_animations'

/**
 * Состояние анимаций приложения.
 */
interface AnimationsState {
  /** Флаг включённых частиц на главной странице. */
  particlesEnabled: boolean
}

const initialState: AnimationsState = {
  particlesEnabled: localStorage.getItem(STORAGE_KEY) === 'true',
}

/**
 * Slice управления анимациями приложения.
 */
const animationsSlice = createSlice({
  name: 'animations',
  initialState,
  reducers: {
    /**
     * Переключение анимации частиц. Сохраняет выбор в localStorage.
     */
    toggleParticles: (state) => {
      state.particlesEnabled = !state.particlesEnabled
      localStorage.setItem(STORAGE_KEY, String(state.particlesEnabled))
    },
    setParticles: (state, action: PayloadAction<boolean>) => {
      state.particlesEnabled = action.payload
      localStorage.setItem(STORAGE_KEY, String(action.payload))
    },
  },
})

export const { toggleParticles, setParticles } = animationsSlice.actions
export default animationsSlice.reducer
