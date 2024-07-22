import { expect, test } from 'vitest'
import { CPF } from './cpf.ts'
import { InvalidCPFError } from '@/core/errors/domain/invalid-cpf.ts'

test('valid cpf', () => {
  const cpf = CPF.create('000.000.000-00')

  const expected = {
    value: cpf.value
  }

  expect(cpf.isRight()).toBe(true)
  expect(cpf).toMatchObject(expected)
})

test('invalid format cpf', () => {
  const cpf = CPF.create('000.000.000.10')

  expect(cpf.isLeft()).toBe(true)
  expect(cpf.value).toBeInstanceOf(InvalidCPFError)
})

test('empty cpf', () => {
  const result = CPF.create('')

  expect(result.isLeft()).toBe(true)
  expect(result.value).toBeInstanceOf(InvalidCPFError)
})

test('invalid cpf with length greater than 11', () => {
  const result = CPF.create('000000000000000')

  expect(result.isLeft()).toBe(true)
  expect(result.value).toBeInstanceOf(InvalidCPFError)
})