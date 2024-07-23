import { expect, test } from 'vitest'
import { Password } from './password.ts'
import { InvalidPasswordError } from '@/core/errors/domain/invalid-password.ts'

test('empty password', () => {
  const password = Password.create('')

  expect(password.isLeft()).toBe(true)
  expect(password.value).toBeInstanceOf(InvalidPasswordError)
})

test('password with lenght less than 6', () => {
  const password = Password.create('12345')

  expect(password.isLeft()).toBe(true)
  expect(password.value).toBeInstanceOf(InvalidPasswordError)
})

test('password with lenght greater than 30', () => {
  const password = Password.create('dsdsadsiajdsapiojdsiajdioajdsioajdioajdaiodjjio')

  expect(password.isLeft()).toBe(true)
  expect(password.value).toBeInstanceOf(InvalidPasswordError)
})

test('valid password', () => {
  const password = Password.create('john-20')

  const expected = {
    value: password.value
  }

  expect(password.isRight()).toBe(true)
  expect(password).toMatchObject(expected)
})

test('hash password', async () => {
  const password = Password.create('john-20')
  if (password.isLeft()) return

  await password.value.hash()
  const isValidPassword = await password.value.compare('john-20')

  expect(password.isRight()).toBe(true)
  expect(isValidPassword).toBe(true)
})