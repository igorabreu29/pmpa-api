import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InMemoryDevelopersRepository } from "test/repositories/in-memory-developers-repository.ts";
import { GetDeveloperProfileUseCase } from "./get-developer-profile.ts";
import { makeDeveloper } from "test/factories/make-developer.ts";

let developersRepository: InMemoryDevelopersRepository
let sut: GetDeveloperProfileUseCase

describe('Get Developer Profile Use Case', () => {
  beforeEach (() => {
    developersRepository = new InMemoryDevelopersRepository()
    sut = new GetDeveloperProfileUseCase (
      developersRepository
    )
  })

  it ('should not be able to get developer profile does not exist', async () => {
    const result = await sut.execute({ id: 'not-found' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get developer profile', async () => {
    const developer = makeDeveloper() 
    developersRepository.create(developer)

    const result = await sut.execute({ id: developer.id.toValue() })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      developer: {
        id: developer.id,
      }
    })
  })
})