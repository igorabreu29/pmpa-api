import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { InMemoryAdministratorsRepository } from "test/repositories/in-memory-administrators-repository.ts";
import { ChangeAdministratorProfileUseCase } from "./change-administrator-profile.ts";
import { makeAdministrator } from "test/factories/make-administrator.ts";

let admnistratorsRepository: InMemoryAdministratorsRepository
let sut: ChangeAdministratorProfileUseCase

describe('Change Administrator Profile Use Case', () => {
  beforeEach (() => {
    admnistratorsRepository = new InMemoryAdministratorsRepository()
    sut = new ChangeAdministratorProfileUseCase(
      admnistratorsRepository
    )
  })

  it ('should not be able to update administrator does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to update administrator', async () => {
    const nameOrError = Name.create('John Doe')
    if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

    const administrator = makeAdministrator({ username: nameOrError.value })
    admnistratorsRepository.create(administrator)

    expect(admnistratorsRepository.items[0].username.value).toEqual('John Doe')

    const result = await sut.execute({
      id: administrator.id.toValue(),
      username: 'Josh Ned'
    })

    expect(result.isRight()).toBe(true)
    expect(admnistratorsRepository.items[0].username.value).toEqual('Josh Ned')
  })
})