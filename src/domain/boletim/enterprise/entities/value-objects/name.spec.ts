import { expect, test } from "vitest";
import { Name } from "./name.ts";
import { faker } from "@faker-js/faker";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";

test('empty name', () => {
  const name = Name.create('')

  expect(name.isLeft()).toBe(true)
  expect(name.value).toBeInstanceOf(InvalidNameError)
})

test('invalid name', () => {
  const name = Name.create(faker.word.words(50))

  expect(name.isLeft()).toBe(true)
  expect(name.value).toBeInstanceOf(InvalidNameError)
})

test('name invalid with length greater than 255', () => {
  const name = Name.create('John Doe')

  expect(name.isRight()).toBe(true)
  expect(name.value).toMatchObject({
    value: 'John Doe'
  })
})