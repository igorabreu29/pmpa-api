import { expect, test } from 'vitest'
import { Email } from './email.ts'
import { InvalidEmailError } from '@/core/errors/domain/invalid-email.ts'

test('invalid format email', () => {
  const result = Email.create('john@gmail')

  expect(result.isLeft()).toBe(true)
  expect(result.value).toBeInstanceOf(InvalidEmailError)
})

test('empty email', () => {
  const result = Email.create('')

  expect(result.isLeft()).toBe(true)
  expect(result.value).toBeInstanceOf(InvalidEmailError)
})

test('valid email', () => {
  const result = Email.create('johndoe@acne.com')

  const expected = {
    value: result.value
  }

  expect(result.isRight()).toBe(true)
  expect(result).toMatchObject(expected)
})