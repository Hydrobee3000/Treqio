import 'reflect-metadata'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { UpdateProfileDto } from './update-profile.dto'

/**
 * Возвращает имена полей, не прошедших валидацию.
 */
async function invalidFields(payload: Record<string, unknown>): Promise<string[]> {
  const dto = plainToInstance(UpdateProfileDto, payload)
  const errors = await validate(dto)
  return errors.map((error) => error.property)
}

describe('UpdateProfileDto', () => {
  it('accepts a regular username', async () => {
    await expect(invalidFields({ username: 'jane_doe' })).resolves.toEqual([])
  })

  it('rejects a username that would shadow an application route', async () => {
    await expect(invalidFields({ username: 'settings' })).resolves.toEqual(['username'])
    await expect(invalidFields({ username: 'profile' })).resolves.toEqual(['username'])
    await expect(invalidFields({ username: 'friends' })).resolves.toEqual(['username'])
  })

  it('rejects uppercase letters and unsupported symbols', async () => {
    await expect(invalidFields({ username: 'JaneDoe' })).resolves.toEqual(['username'])
    await expect(invalidFields({ username: 'jane-doe' })).resolves.toEqual(['username'])
  })

  it('allows omitting every field', async () => {
    await expect(invalidFields({})).resolves.toEqual([])
  })
})
