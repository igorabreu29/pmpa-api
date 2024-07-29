import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InMemoryAdministratorsRepository } from "test/repositories/in-memory-administrators-repository.ts";
import { makeAdministrator } from "test/factories/make-administrator.ts";
import { DeleteAdministratorUseCase } from "./delete-administrator.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

let admnistratorsRepository: InMemoryAdministratorsRepository
let sut: DeleteAdministratorUseCase

describe('Delete Administrator Use Case', () => {
  beforeEach (() => {
    admnistratorsRepository = new InMemoryAdministratorsRepository()
    sut = new DeleteAdministratorUseCase(
      admnistratorsRepository
    )
  })

  it ('should not be able to delete a administrator if access is not dev', async () => {
    const administrator = makeAdministrator()
    admnistratorsRepository.create(administrator)

    const result = await sut.execute({
      id: administrator.id.toValue(),
      role: 'admin',
      userId: '',
      userIp: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to delete a administrator that does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found',
      role: 'dev',
      userId: '',
      userIp: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to update administrator', async () => {
    const administrator = makeAdministrator()
    admnistratorsRepository.create(administrator)

    const result = await sut.execute({
      id: administrator.id.toValue(),
      role: 'dev',
      userId: '',
      userIp: ''
    })

    expect(result.isRight()).toBe(true)
    expect(admnistratorsRepository.items).toHaveLength(0)
  })
})