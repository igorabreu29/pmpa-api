import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Birthday } from './birthday.ts'
import { InvalidBirthdayError } from '@/core/errors/domain/invalid-birthday.ts'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('birthday date before from current', () => {
  vi.setSystemTime(new Date('2022-1-10'))
  const result = Birthday.create(new Date('2022-1-11'))

  expect(result.isLeft()).toBe(true)
  expect(result.value).toBeInstanceOf(InvalidBirthdayError)
})

test('birthday less than 18', () => {
  vi.setSystemTime(new Date('2022-1-10'))
  const result = Birthday.create(new Date('2008-1-2'))

  expect(result.isLeft()).toBe(true)
  expect(result.value).toBeInstanceOf(InvalidBirthdayError)
})

test('valid birthday', () => {
  vi.setSystemTime(new Date('2022-1-10'))

  const result = Birthday.create(new Date('2004'))

  expect(result.isRight()).toBe(true)
  expect(result.value).toEqual(result.value)
})