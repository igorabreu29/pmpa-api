import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ChangeManagerAvatarUseCase } from "./change-manager-avatar.ts";
import { makeManager } from "test/factories/make-manager.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import type { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import type { InMemoryManagersPolesRepository } from "test/repositories/in-memory-managers-poles-repository.ts";
import type { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import type { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";

let managerCoursesRepository: InMemoryManagersCoursesRepository
let managerPolesRepository: InMemoryManagersPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository

let managersRepository: InMemoryManagersRepository
let sut: ChangeManagerAvatarUseCase

describe('Change Manager Avatar Use Case', () => {
  beforeEach(() => {
    managersRepository = new InMemoryManagersRepository(
      managerCoursesRepository,
      coursesRepository,
      managerPolesRepository,
      polesRepository
    )
    sut = new ChangeManagerAvatarUseCase (
      managersRepository
    )
  })

  it ('should not be able to change avatar if manager does not exist', async () => {
    const fileLink = 'http://localhost:3333/faker.jpeg'

    const result = await sut.execute({
      id: 'not-found',
      fileLink,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to change avatar', async () => {
    const manager = makeManager({
      avatarUrl: 'http://localhost:3333/fake.jpeg'
    })
    managersRepository.create(manager)

    const fileLink = 'http://localhost:3333/faker.jpeg'

    const result = await sut.execute({
      id: manager.id.toValue(),
      fileLink,
    })

    expect(result.isRight()).toBe(true)
    expect(managersRepository.items[0].avatarUrl).toEqual(fileLink)
  })
})