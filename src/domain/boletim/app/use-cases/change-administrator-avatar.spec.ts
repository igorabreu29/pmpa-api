import { InMemoryAdministratorsRepository } from "test/repositories/in-memory-administrators-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ChangeAdministratorAvatarUseCase } from "./change-administrator-avatar.ts";
import { makeAdministrator } from "test/factories/make-administrator.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

let administratorsRepository: InMemoryAdministratorsRepository
let sut: ChangeAdministratorAvatarUseCase

describe('Change Administrator Avatar Use Case', () => {
  beforeEach(() => {
    administratorsRepository = new InMemoryAdministratorsRepository()
    sut = new ChangeAdministratorAvatarUseCase (
      administratorsRepository
    )
  })

  it ('should not be able to change avatar if administrator does not exist', async () => {
    const fileLink = 'http://localhost:3333/faker.jpeg'

    const result = await sut.execute({
      id: 'not-found',
      fileLink,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to change avatar', async () => {
    const administrator = makeAdministrator({
      avatarUrl: 'http://localhost:3333/fake.jpeg'
    })
    administratorsRepository.create(administrator)

    const fileLink = 'http://localhost:3333/faker.jpeg'

    const result = await sut.execute({
      id: administrator.id.toValue(),
      fileLink,
    })

    expect(result.isRight()).toBe(true)
    expect(administratorsRepository.items[0].avatarUrl).toEqual(fileLink)
  })
})