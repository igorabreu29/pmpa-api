import { InMemoryDevelopersRepository } from "test/repositories/in-memory-developers-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ChangeDeveloperAvatarUseCase } from "./change-developer-avatar.ts";
import { makeDeveloper } from "test/factories/make-developer.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

let developersRepository: InMemoryDevelopersRepository
let sut: ChangeDeveloperAvatarUseCase

describe('Change Developer Avatar Use Case', () => {
  beforeEach(() => {
    developersRepository = new InMemoryDevelopersRepository()
    sut = new ChangeDeveloperAvatarUseCase (
      developersRepository
    )
  })

  it ('should not be able to change avatar if developer does not exist', async () => {
    const fileLink = 'http://localhost:3333/faker.jpeg'

    const result = await sut.execute({
      id: 'not-found',
      fileLink,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to change avatar', async () => {
    const developer = makeDeveloper({
      avatarUrl: 'http://localhost:3333/fake.jpeg'
    })
    developersRepository.create(developer)

    const fileLink = 'http://localhost:3333/faker.jpeg'

    const result = await sut.execute({
      id: developer.id.toValue(),
      fileLink,
    })

    expect(result.isRight()).toBe(true)
    expect(developersRepository.items[0].avatarUrl).toEqual(fileLink)
  })
})