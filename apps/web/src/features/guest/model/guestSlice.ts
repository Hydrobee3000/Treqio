import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

const STORAGE_KEY = 'treqio_guest_profile'

/**
 * Профиль гостевого пользователя, хранимый в localStorage.
 */
interface GuestProfile {
  /** Отображаемое имя, заданное гостем. */
  displayName: string | null
}

function loadProfile(): GuestProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as GuestProfile
  } catch {
    // ignore parse errors
  }
  return { displayName: null }
}

function saveProfile(profile: GuestProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

/**
 * Slice данных гостевого пользователя.
 */
const guestSlice = createSlice({
  name: 'guest',
  initialState: loadProfile,
  reducers: {
    /**
     * Обновление отображаемого имени гостя.
     */
    setGuestDisplayName: (state, action: PayloadAction<string>) => {
      state.displayName = action.payload
      saveProfile({ ...state })
    },

    /**
     * Сброс данных гостя при выходе или входе в аккаунт.
     */
    clearGuestProfile: (state) => {
      state.displayName = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})

export const { setGuestDisplayName, clearGuestProfile } = guestSlice.actions
export default guestSlice.reducer
