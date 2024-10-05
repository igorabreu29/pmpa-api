import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts"
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts"
import { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts"
import { InMemoryManagersPolesRepository } from "test/repositories/in-memory-managers-poles-repository.ts"
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts"
import { DeleteManagerCourseUseCase } from "./delete-manager-course.ts"
import { beforeEach, describe, expect, it } from "vitest"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { makeCourse } from "test/factories/make-course.ts"
import { makeManager } from "test/factories/make-manager.ts"
import { makeManagerCourse } from "test/factories/make-manager-course.ts"

let managersPolesRepository: InMemoryManagersPolesRepository
let polesRepository: InMemoryPolesRepository

let coursesRepository: InMemoryCoursesRepository
let managersRepository: InMemoryManagersRepository
let managerCoursesRepository: InMemoryManagersCoursesRepository
let sut: DeleteManagerCourseUseCase

describe('Delete Manager Course Use Case', () => {
  beforeEach(() => {
    polesRepository = new InMemoryPolesRepository()
    managersPolesRepository = new InMemoryManagersPolesRepository()
    coursesRepository = new InMemoryCoursesRepository()
    managersRepository = new InMemoryManagersRepository (
      managerCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    managerCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )

    sut = new DeleteManagerCourseUseCase(
      coursesRepository,
      managersRepository,
      managerCoursesRepository
    )
  })

  it ('should receive instance of "Resource Not Found" error if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found',
      managerId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should receive instance of "Resource Not Found" error if manager does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      managerId: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should receive instance of "Resource Not Found" error if manager course does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const manager = makeManager()
    managersRepository.create(manager)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      managerId: manager.id.toValue()
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to delete manager course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const manager = makeManager()
    managersRepository.create(manager)

    const managerCourse = makeManagerCourse({
      courseId: course.id,
      managerId: manager.id
    })
    managerCoursesRepository.create(managerCourse)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      managerId: manager.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(managerCoursesRepository.items).toHaveLength(0)
  })
})