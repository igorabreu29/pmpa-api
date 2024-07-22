import { NotAllowedError } from '@/core/errors/use-case/not-allowed-error.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { makeManager } from 'test/factories/make-manager.ts'
import { DeleteManagerUseCase } from './delete-manager.ts'
import { makeManagerCourse } from 'test/factories/make-manager-course.ts'
import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'
import { makeManagerPole } from 'test/factories/make-manager-pole.ts'

let managersCoursesRepository: InMemoryManagersCoursesRepository
let coursesRepository: InMemoryCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let polesRepository: InMemoryPolesRepository

let managersRepository: InMemoryManagersRepository
let sut: DeleteManagerUseCase

describe('Delete Manager Use Case', () => { 
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
    sut = new DeleteManagerUseCase (
      managersRepository
    )
  })

  it ('should not be able to delete a manager that does not exist', async () => {
    const result = await sut.execute({ id: 'not-found', role: ''})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to delete a manager if role to be manager or manager', async () => {
    const manager = makeManager()
    managersRepository.create(manager)

    const result = await sut.execute({ id: manager.id.toValue(), role: 'manager' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should be able to delete a manager', async () => {
    const manager1 = makeManager()
    managersRepository.create(manager1)

    const manager2 = makeManager()
    managersRepository.create(manager2)

    const managerCourse1 = makeManagerCourse({
      courseId: new UniqueEntityId('course-1'),
      managerId: manager1.id
    })
    managersCoursesRepository.create(managerCourse1)
    
    const managerCourse2 = makeManagerCourse({
      courseId: new UniqueEntityId('course-2'),
      managerId: manager1.id
    })
    managersCoursesRepository.create(managerCourse2)

    const managerCourse3 = makeManagerCourse({
      courseId: new UniqueEntityId('course-2'),
      managerId: manager2.id
    })
    managersCoursesRepository.create(managerCourse3)

    const managerPole1 = makeManagerPole({
      poleId: new UniqueEntityId('course-1'),
      managerId: managerCourse1.id
    })
    managersPolesRepository.create(managerPole1)
    
    const managerPole2 = makeManagerPole({
      poleId: new UniqueEntityId('course-2'),
      managerId: managerCourse2.id
    })
    managersPolesRepository.create(managerPole2)

    const result = await sut.execute({ id: manager1.id.toValue(), role: 'admin' })

    expect(result.isRight()).toBe(true)
    expect(managersCoursesRepository.items).toHaveLength(1)
    expect(managersPolesRepository.items).toHaveLength(0)
    expect(managersRepository.items).toHaveLength(1)
  })
})