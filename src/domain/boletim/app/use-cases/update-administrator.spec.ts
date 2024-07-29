import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { InMemoryAdministratorsRepository } from "test/repositories/in-memory-administrators-repository.ts";
import { makeAdministrator } from "test/factories/make-administrator.ts";
import { UpdateAdministratorUseCase } from "./update-administrator.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

let admnistratorsRepository: InMemoryAdministratorsRepository
let sut: UpdateAdministratorUseCase 

describe('Update Administrator Use Case', () => {
  beforeEach (() => {
    admnistratorsRepository = new InMemoryAdministratorsRepository()
    sut = new UpdateAdministratorUseCase (
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
  
  it ('should not be able to update a administrator that does not exist', async () => {
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
    const nameOrError = Name.create('John Doe')
    if (nameOrError.isLeft()) return

    const administrator = makeAdministrator({ username: nameOrError.value })
    admnistratorsRepository.create(administrator)

    expect(admnistratorsRepository.items[0].username.value).toEqual('John Doe')

    const result = await sut.execute({
      id: administrator.id.toValue(),
      username: 'Josh Ned',
      role: 'dev',
      userId: '',
      userIp: ''
    })

    expect(result.isRight()).toBe(true)
    expect(admnistratorsRepository.items[0].username.value).toEqual('Josh Ned')
  })
})