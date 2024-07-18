import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import { InMemoryManagersPolesRepository } from "test/repositories/in-memory-managers-poles-repository.ts";
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts";
import { ChangeManagerProfileUseCase } from "./change-manager-profile.ts";
import { makeManager } from "test/factories/make-manager.ts";

let managersCoursesRepository: InMemoryManagersCoursesRepository
let coursesRepository: InMemoryCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let polesRepository: InMemoryPolesRepository

let managersRepository: InMemoryManagersRepository
let sut: ChangeManagerProfileUseCase

describe('Change Manager Profile Use Case', () => {
  beforeEach (() => {
    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository()
    managersPolesRepository = new InMemoryManagersPolesRepository( )
    polesRepository = new InMemoryPolesRepository()

    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    
    sut = new ChangeManagerProfileUseCase(
      managersRepository
    )
  })

  it ('should not be able to change manager profile does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to change manager profile', async () => {
    const nameOrError = Name.create('John Doe')
    if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

    const manager = makeManager({ username: nameOrError.value })
    managersRepository.create(manager)

    expect(managersRepository.items[0].username.value).toEqual('John Doe')

    const result = await sut.execute({
      id: manager.id.toValue(),
      username: 'Josh Ned'
    })

    expect(result.isRight()).toBe(true)
    expect(managersRepository.items[0].username.value).toEqual('Josh Ned')
  })
})