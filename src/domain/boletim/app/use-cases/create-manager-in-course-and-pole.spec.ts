import { describe, it, beforeEach, expect } from 'vitest'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { FakeHasher } from 'test/cryptograpy/fake-hasher.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { ResourceAlreadyExistError } from '@/core/errors/use-case/resource-already-exist-error.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { CreateManagerInCourseAndPole } from './create-manager-in-course-and-pole.ts'
import { makeManager } from 'test/factories/make-manager.ts'
import { makeManagerCourse } from 'test/factories/make-manager-course.ts'

let managersRepository: InMemoryManagersRepository
let managersCoursesRepository: InMemoryManagersCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let hasher: FakeHasher
let sut: CreateManagerInCourseAndPole

describe('Create Manager In Course And Pole', () => {
  beforeEach(() => {
    managersRepository = new InMemoryManagersRepository()
    managersPolesRepository = new InMemoryManagersPolesRepository()
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    hasher = new FakeHasher()
    sut = new CreateManagerInCourseAndPole(
      managersRepository,
      managersCoursesRepository,
      managersPolesRepository,
      coursesRepository,
      polesRepository,
      hasher
    )
  })

  it ('should not be able to create manager if course not found', async () => {
    const result = await sut.execute({
      courseId: '',
      poleId: '',
      cpf: '',
      email: '',
      username: '',
      birthday: new Date(),
      civilID: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create manager if pole not found', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: '',
      cpf: '',
      email: '',
      username: '',
      birthday: new Date(),
      civilID: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create manager in course if manager with same cpf already be present in course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const manager = makeManager()
    managersRepository.create(manager)

    const managerCourse = makeManagerCourse({ courseId: course.id, managerId: manager.id })
    managersCoursesRepository.create(managerCourse)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      cpf: manager.cpf,
      email: '',
      username: '',
      birthday: new Date(),
      civilID: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should not be able to create manager in course if manager with same email already be present in course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const manager = makeManager()
    managersRepository.create(manager)

    const managerCourse = makeManagerCourse({ courseId: course.id, managerId: manager.id })
    managersCoursesRepository.create(managerCourse)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      cpf: '',
      email: manager.email,
      username: '',
      birthday: new Date(),
      civilID: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create manager with same cpf in course and pole', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const manager = makeManager({ birthday: new Date() })
    managersRepository.create(manager)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      cpf: manager.cpf,
      email: manager.email,
      username: manager.username,
      birthday: manager.birthday,
      civilID: 0
    })

    expect(result.isRight()).toBe(true)
    expect(managersCoursesRepository.items).toHaveLength(1)
    expect(managersPolesRepository.items).toHaveLength(1)
  })

  it ('should be able to create manager with same email in course and pole', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const manager = makeManager({ birthday: new Date() })
    managersRepository.create(manager)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      cpf: '222.222.222-10',
      email: manager.email,
      username: manager.username,
      birthday: manager.birthday,
      civilID: 0
    })

    expect(result.isRight()).toBe(true)
    expect(managersCoursesRepository.items).toHaveLength(1)
    expect(managersPolesRepository.items).toHaveLength(1)
  })

  it ('should be able to create manager in course and pole', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      cpf: '222.222.222-10',
      email: 'john@example.com',
      username: 'John Doe',
      birthday: new Date('2022'),
      civilID: 44444
    })

    expect(result.isRight()).toBe(true)
    expect(managersRepository.items).toHaveLength(1)
    expect(managersCoursesRepository.items).toHaveLength(1)
    expect(managersPolesRepository.items).toHaveLength(1)
  })
})