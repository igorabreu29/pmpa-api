import { InMemoryAuthenticatesRepository } from "test/repositories/in-memory-authenticates-repository.ts";
import { RestorePasswordUseCase } from "./restore-password.ts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { makeAuthenticate } from "test/factories/make-authenticate.ts";

import bcrypt from 'bcryptjs'

let authenticatesRepository: InMemoryAuthenticatesRepository
let sut: RestorePasswordUseCase

describe('Restore Password Use Case', () => {
  beforeEach(() => {
    authenticatesRepository = new InMemoryAuthenticatesRepository()
    sut = new RestorePasswordUseCase(authenticatesRepository)
  })

  it ('should receive instance of "ResourceNotFoundError" if user does not exist', async () => {
    const result = await sut.execute({
      email: 'not-found',
      newPassword: '',
      confirmPassword: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should receive instance of "ConflictError" if passwords sent is not equals', async () => {
    const user = makeAuthenticate()
    authenticatesRepository.items.push(user)

    const result = await sut.execute({
      email: user.email.value,
      newPassword: '20',
      confirmPassword: '2020'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should restore password', async () => {
    const user = makeAuthenticate()
    authenticatesRepository.items.push(user)

    const password = 'node-2020'
    
    const spyOn = vi.spyOn(bcrypt, 'hash')
    spyOn.mockImplementationOnce(() => `${password}-hash`)

    const result = await sut.execute({
      email: user.email.value,
      newPassword: password,
      confirmPassword: password
    })

    expect(result.isRight()).toBe(true)
    expect(authenticatesRepository.items[0].passwordHash.value).toEqual('node-2020-hash')
  })
})