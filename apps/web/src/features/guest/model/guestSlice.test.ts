import { describe, it, expect } from 'vitest'
import { guestReducer, setGuestDisplayName } from '..'
import { GUEST_STORAGE_KEY } from '../model/guestSlice'

describe('guestSlice', () => {
  it('начальное состояние - displayName равно null', () => {
    const result = guestReducer(undefined, { type: '' })
    expect(result.displayName).toBeNull()
  })

  it('setGuestDisplayName сохраняет имя в state и localStorage', () => {
    const userName = 'user name'
    const state = guestReducer(undefined, setGuestDisplayName(userName))

    const raw = localStorage.getItem(GUEST_STORAGE_KEY)
    const stored = JSON.parse(raw!)
    expect(stored.displayName).toBe(userName)
    expect(state.displayName).toBe(userName)
  })
})
