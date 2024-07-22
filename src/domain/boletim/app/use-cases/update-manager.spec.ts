import { NotAllowedError } from '@/core/errors/use-case/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { Name } from '../../enterprise/entities/value-objects/name.ts'
import { UpdateManagerUseCase } from './update-manager.ts'
import { makeManager } from 'test/factories/make-manager.ts'

let managersCoursesRepository: InMemoryManagersCoursesRepository
let coursesRepository: InMemoryCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let polesRepository: InMemoryPolesRepository

let managersRepository: InMemoryManagersRepository
let sut: UpdateManagerUseCase

describe('Update Manager Use Case', () => { 
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

    managersRepository = new InMemoryManagersRepository (
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    sut = new UpdateManagerUseCase (
      managersRepository
    )
  })

  it ('should not be able to update a manager that does not exist', async () => {
    const result = await sut.execute({ id: 'not-found', role: ''})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update a manager if role to be manager or manager', async () => {
    const manager = makeManager()
    managersRepository.create(manager)

    const result = await sut.execute({ id: manager.id.toValue(), role: 'manager', username: '' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should be able to update a manager', async () => {
    const nameOrError = Name.create('John Doe')
    if (nameOrError.isLeft()) return
    
    const manager = makeManager({ username: nameOrError.value, civilId: 1234567 })
    managersRepository.create(manager)

    const result = await sut.execute({ id: manager.id.toValue(), role: 'admin', username: 'Josh Ned', civilId: 2345678 })

    expect(result.isRight()).toBe(true)
    expect(managersRepository.items[0].username.value).toEqual('Josh Ned')
    expect(managersRepository.items[0].civilId).toEqual(2345678)
  })
})