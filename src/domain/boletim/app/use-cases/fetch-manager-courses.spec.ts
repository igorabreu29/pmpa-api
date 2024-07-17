import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeManagerCourse } from 'test/factories/make-manager-course.ts'
import { makeManager } from 'test/factories/make-manager.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryManagersCoursesRepository } from 'test/repositories/in-memory-managers-courses-repository.ts'
import { InMemoryManagersPolesRepository } from 'test/repositories/in-memory-managers-poles-repository.ts'
import { InMemoryManagersRepository } from 'test/repositories/in-memory-managers-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { FetchManagerCoursesUseCase } from './fetch-manager-courses.ts'

let managersRepository: InMemoryManagersRepository
let coursesRepository: InMemoryCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let polesRepository: InMemoryPolesRepository
let managersCoursesRepository: InMemoryManagersCoursesRepository
let sut: FetchManagerCoursesUseCase

describe('Fetch Manager Courses Use Case', () => {
  beforeEach(() => {
    managersRepository = new InMemoryManagersRepository()
    coursesRepository = new InMemoryCoursesRepository()
    managersPolesRepository = new InMemoryManagersPolesRepository()
    polesRepository = new InMemoryPolesRepository()
    managersCoursesRepository = new InMemoryManagersCoursesRepository (
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )

    sut = new FetchManagerCoursesUseCase(
      managersRepository,
      managersCoursesRepository
    )
  })

  it ('should not be able to fetch manager courses if course does not exist.', async () => {
    const result = await sut.execute({
      managerId: 'not-found',
      page: 1,
      perPage: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to fetch manager courses', async () => {
    const manager = makeManager()
    managersRepository.create(manager)

    const course1 = makeCourse()
    const course2 = makeCourse()
    coursesRepository.create(course1)
    coursesRepository.create(course2)

    const managerCourse1 = makeManagerCourse({ managerId: manager.id, courseId: course1.id })
    const managerCourse2 = makeManagerCourse({ managerId: manager.id, courseId: course2.id })
    managersCoursesRepository.create(managerCourse1)
    managersCoursesRepository.create(managerCourse2)

    const result = await sut.execute({
      managerId: manager.id.toValue(),
      page: 1,
      perPage: 6
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      courses: [
        {
          managerId: manager.id,
          courseId: course1.id,
          course: course1.name.value,
        },
        {
          managerId: manager.id,
          courseId: course2.id,
          course: course2.name.value,
        },
      ]
    })
  })

  it ('should be able to paginated manager courses', async () => {
    const manager = makeManager()
    managersRepository.create(manager)

    for (let i = 1; i <= 8; i++) {
      const course = makeCourse()
      const managerCourse = makeManagerCourse({ managerId: manager.id, courseId: course.id })
      coursesRepository.create(course)
      managersCoursesRepository.create(managerCourse)
    }

    const result = await sut.execute({ managerId: manager.id.toValue(), page: 2, perPage: 6 })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      pages: 2,
      totalItems: 8
    })
  })
})