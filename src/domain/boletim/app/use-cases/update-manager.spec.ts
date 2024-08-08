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
import { makeManagerCourse } from 'test/factories/make-manager-course.ts'
import { makeManagerPole } from 'test/factories/make-manager-pole.ts'
import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makePole } from 'test/factories/make-pole.ts'

let managersCoursesRepository: InMemoryManagersCoursesRepository
let coursesRepository: InMemoryCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let polesRepository: InMemoryPolesRepository

let managersRepository: InMemoryManagersRepository
let sut: UpdateManagerUseCase

describe('Update Manager Use Case', () => { 
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    managersPolesRepository = new InMemoryManagersPolesRepository()
    polesRepository = new InMemoryPolesRepository()

    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )

    managersRepository = new InMemoryManagersRepository (
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    sut = new UpdateManagerUseCase (
      managersRepository,
      managersCoursesRepository,
      managersPolesRepository,
    )
  })

  it ('should not be able to update a manager if access is manager or manager', async () => {
    const manager = makeManager()
    managersRepository.create(manager)

    const result = await sut.execute({ 
      id: manager.id.toValue(), 
      role: 'manager', 
      courseId: '',
      newCourseId: '',
      poleId: '',
      userId: '', 
      userIp: '' ,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to update a manager that does not exist', async () => {
    const result = await sut.execute({ 
      id: 'not-found', 
      role: '', 
      courseId: '',
      newCourseId: '',
      poleId: '',
      userId: '', 
      userIp: '' 
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update manager if manager is not in the course', async () => {
    const manager = makeManager()
    managersRepository.create(manager)

    const result = await sut.execute({ 
      id: manager.id.toValue(), 
      role: 'admin', 
      courseId: 'not-found',
      newCourseId: 'course-1',
      poleId: 'pole-1',
      userId: '', 
      userIp: '' 
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to update a manager course', async () => {
    const manager = makeManager()
    managersRepository.create(manager)

    const managerCourse = makeManagerCourse({
      managerId: manager.id,
      courseId: new UniqueEntityId('course')
    })
    managersCoursesRepository.create(managerCourse)

    const managerPole = makeManagerPole({
      managerId: managerCourse.id,
      poleId: new UniqueEntityId('pole')
    })
    managersPolesRepository.create(managerPole)

    const result = await sut.execute({ 
      id: manager.id.toValue(), 
      role: 'admin', 
      courseId: managerCourse.courseId.toValue(),
      newCourseId: 'new-course',
      poleId: 'pole-1',
      userId: '', 
      userIp: '' 
    })

    expect(result.isRight()).toBe(true)
    expect(managersCoursesRepository.items[0]).toMatchObject({
      courseId: {
        value: 'new-course'
      }
    })

    expect(managersPolesRepository.items[0]).toMatchObject({
      poleId: {
        value: 'pole-1'
      }
    })
  })

  it ('should be able to update a manager pole', async () => {
    const manager = makeManager()
    managersRepository.create(manager)

    const course = makeCourse()
    const pole = makePole()

    const managerCourse = makeManagerCourse({
      managerId: manager.id,
      courseId: course.id
    })
    managersCoursesRepository.create(managerCourse)

    const managerPole = makeManagerPole({
      managerId: managerCourse.id,
      poleId: pole.id
    })
    managersPolesRepository.create(managerPole)

    const result = await sut.execute({ 
      id: manager.id.toValue(), 
      role: 'admin', 
      courseId: course.id.toValue(),
      newCourseId: course.id.toValue(),
      poleId: 'new-pole',
      userId: '', 
      userIp: '' 
    })

    expect(result.isRight()).toBe(true)
    expect(managersPolesRepository.items[0]).toMatchObject({
      managerId: managerCourse.id,
      poleId: {
        value: 'new-pole'
      }
    })
  })

  it ('should be able to update a manager', async () => {
    const nameOrError = Name.create('John Doe')
    if (nameOrError.isLeft()) return
    
    const manager = makeManager({ username: nameOrError.value })
    managersRepository.create(manager)

    const managerCourse = makeManagerCourse({
      managerId: manager.id,
    })
    managersCoursesRepository.create(managerCourse)

    const managerPole = makeManagerPole({
      managerId: managerCourse.id
    })
    managersPolesRepository.create(managerPole)

    const result = await sut.execute({ 
      id: manager.id.toValue(), 
      role: 'admin', 
      username: 'Josh Ned', 
      courseId: managerCourse.courseId.toValue(),
      newCourseId: managerCourse.courseId.toValue(),
      poleId: managerPole.poleId.toValue(),
      userId: '', 
      userIp: '' 
    })
    
    expect(result.isRight()).toBe(true)
    expect(managersRepository.items[0].username.value).toEqual('Josh Ned')
  })
})