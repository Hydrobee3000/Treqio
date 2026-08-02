import { describe, it, expect, beforeEach } from 'vitest'
import authReducer, {
  setCredentials,
  enterAsGuest,
  logout,
  setInitialized,
  GUEST_KEY,
} from './authSlice'

describe('authSlice', () => {
  // initialState теперь функция loadAuthState — Redux вызывает её лениво,
  // когда редьюсеру передают state === undefined. Она читает localStorage,
  // поэтому очищаем его перед каждым тестом, чтобы тесты не влияли друг на друга.
  beforeEach(() => {
    localStorage.clear()
  })

  it('начальное состояние - isGuest равен false если флаг гостя не сохранён', () => {
    // authReducer(undefined, ...) — стандартный способ получить начальное состояние:
    // Redux вызывает loadAuthState() именно в этот момент, не при импорте модуля.
    const state = authReducer(undefined, { type: '' })

    expect(state.isGuest).toBe(false)
    expect(state.accessToken).toBeNull()
    expect(state.isInitialized).toBe(false)
  })

  it('начальное состояние - isGuest равен true если флаг гостя сохранён в localStorage', () => {
    localStorage.setItem(GUEST_KEY, 'true')

    const state = authReducer(undefined, { type: '' })

    expect(state.isGuest).toBe(true)
  })

  it('setCredentials сохраняет токен, сбрасывает isGuest', () => {
    // Начинаем из гостевого состояния, чтобы проверить что вход в аккаунт его сбрасывает
    localStorage.setItem(GUEST_KEY, 'true')
    const guestState = authReducer(undefined, { type: '' })

    const state = authReducer(guestState, setCredentials({ accessToken: 'token123' }))

    expect(state.accessToken).toBe('token123')
    expect(state.isGuest).toBe(false)
    expect(localStorage.getItem(GUEST_KEY)).toBeNull()
  })

  it('enterAsGuest включает гостевой режим и сохраняет флаг в localStorage', () => {
    const initial = authReducer(undefined, { type: '' })

    const state = authReducer(initial, enterAsGuest())

    expect(state.isGuest).toBe(true)
    expect(state.accessToken).toBeNull()
    expect(localStorage.getItem(GUEST_KEY)).toBe('true')
  })

  it('logout очищает данные пользователя и localStorage', () => {
    localStorage.setItem(GUEST_KEY, 'true')
    const guestState = authReducer(undefined, { type: '' })
    const loggedInState = authReducer(guestState, setCredentials({ accessToken: 'token123' }))

    const state = authReducer(loggedInState, logout())

    expect(state.accessToken).toBeNull()
    expect(state.isGuest).toBe(false)
    expect(localStorage.getItem(GUEST_KEY)).toBeNull()
  })

  it('setInitialized устанавливает isInitialized в true', () => {
    const initial = authReducer(undefined, { type: '' })

    const state = authReducer(initial, setInitialized())

    expect(state.isInitialized).toBe(true)
  })
})
