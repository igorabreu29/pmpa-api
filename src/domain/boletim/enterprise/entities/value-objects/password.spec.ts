import { expect, test } from 'vitest'
import { Password } from './password.ts'
import { InvalidPasswordError } from '@/core/errors/domain/invalid-password.ts'

test('empty password', () => {
  const result = Password.create('')

  expect(result.isLeft()).toBe(true)
  expect(result.value).toBeInstanceOf(InvalidPasswordError)
})

test('password with lenght less than 6', () => {
  const result = Password.create('12345')

  expect(result.isLeft()).toBe(true)
  expect(result.value).toBeInstanceOf(InvalidPasswordError)
})

test('password with lenght greater than 30', () => {
  const result = Password.create('dsdsadsiajdsapiojdsiajdioajdsioajdioajdaiodjjio')

  expect(result.isLeft()).toBe(true)
  expect(result.value).toBeInstanceOf(InvalidPasswordError)
})

test('valid password', () => {
  const result = Password.create('john-20')

  const expected = {
    value: result.value
  }

  expect(result.isRight()).toBe(true)
  expect(result).toMatchObject(expected)
})