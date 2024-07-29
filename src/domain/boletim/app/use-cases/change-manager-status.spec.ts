import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { ChangeManagerStatusUseCase } from "./change-manager-status.ts";
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts";
import { makeManager } from "test/factories/make-manager.ts";
import { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryManagersPolesRepository } from "test/repositories/in-memory-managers-poles-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";

let managersCoursesRepository: InMemoryManagersCoursesRepository
let coursesRepository: InMemoryCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let polesRepository: InMemoryPolesRepository

let managersRepository: InMemoryManagersRepository
let sut: ChangeManagerStatusUseCase

describe('Change Manager Status Use Case', () => {
  beforeEach(() => {
    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository()
    managersPolesRepository = new InMemoryManagersPolesRepository()
    polesRepository = new InMemoryPolesRepository()

    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    sut = new ChangeManagerStatusUseCase(managersRepository)
  })

  it ('should not be able to update a manager if access is student or manager', async () => {
    const result = await sut.execute({ id: 'not-found', status: false, role: 'manager' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to change status if user not exist', async () => {
    const result = await sut.execute({ id: 'not-found', status: false, role: 'admin' })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to change student status', async () => {
    const manager = makeManager()
    managersRepository.create(manager)

    const result = await sut.execute({ id: manager.id.toValue(), status: false, role: 'admin' })

    expect(result.isRight()).toBe(true)
    expect(managersRepository.items[0].active).toBe(false)
  })
})