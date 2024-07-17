import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { EndsAt } from "./ends-at.ts";
import { InvalidDateError } from "@/core/errors/domain/invalid-date.ts";

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('should receive an error if ends at to be less than the current date', () => {
  vi.setSystemTime('2022-1-10')

  const endsAt = EndsAt.create(new Date('2022-1-9'))

  expect(endsAt.isLeft()).toBe(true)
  expect(endsAt.value).toBeInstanceOf(InvalidDateError)
})

test('should receive the ends at date', () => {
  vi.setSystemTime('2022-1-10')

  const endsAt = EndsAt.create(new Date('2022-1-11'))

  expect(endsAt.isRight()).toBe(true)
  expect(endsAt.value).toEqual(endsAt.value)
})