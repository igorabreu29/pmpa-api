import { InMemoryAuthenticatesRepository } from "test/repositories/in-memory-authenticates-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ChangeUserRoleUseCase } from "./change-user-role.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeAuthenticate } from "test/factories/make-authenticate.ts";

let authenticatesRepository: InMemoryAuthenticatesRepository
let sut: ChangeUserRoleUseCase

describe('Change User Role', () => {
  beforeEach(() => {
    authenticatesRepository = new InMemoryAuthenticatesRepository()
    sut = new ChangeUserRoleUseCase(authenticatesRepository)
  })

  it ('should receive error if user access is not equal to dev', async () => {
    const result = await sut.execute({
      id: '',
      role: 'admin',
      userAccess: 'admin'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should receive error if user access does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found',
      role: 'admin',
      userAccess: 'dev'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should update user role', async () => {
    const authenticate = makeAuthenticate({
      role: 'student'
    })
    authenticatesRepository.items.push(authenticate)

    const result = await sut.execute({
      id: authenticate.id.toValue(),
      role: 'admin',
      userAccess: 'dev'
    })

    expect(result.isRight()).toBe(true)
    expect(authenticatesRepository.items[0].role).equal('admin')
  })
})