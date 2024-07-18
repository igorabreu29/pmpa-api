import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeDeveloper } from "test/factories/make-developer.ts";
import { InMemoryDevelopersRepository } from "test/repositories/in-memory-developers-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { ChangeDeveloperProfileUseCase } from "./change-developer-profile.ts";

let developersRepository: InMemoryDevelopersRepository
let sut: ChangeDeveloperProfileUseCase

describe('Change Developer Profile Use Case', () => {
  beforeEach (() => {
    developersRepository = new InMemoryDevelopersRepository()
    sut = new ChangeDeveloperProfileUseCase(
      developersRepository
    )
  })

  it ('should not be able to change developer profile does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to change developer profile', async () => {
    const nameOrError = Name.create('John Doe')
    if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

    const developer = makeDeveloper({ username: nameOrError.value })
    developersRepository.create(developer)

    expect(developersRepository.items[0].username.value).toEqual('John Doe')

    const result = await sut.execute({
      id: developer.id.toValue(),
      username: 'Josh Ned'
    })

    expect(result.isRight()).toBe(true)
    expect(developersRepository.items[0].username.value).toEqual('Josh Ned')
  })
})