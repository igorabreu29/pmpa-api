import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeManagerCourse } from "test/factories/make-manager-course.ts";
import { makeManagerPole } from "test/factories/make-manager-pole.ts";
import { makeManager } from "test/factories/make-manager.ts";
import { makePole } from "test/factories/make-pole.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import { InMemoryManagersPolesRepository } from "test/repositories/in-memory-managers-poles-repository.ts";
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { FetchCourseManagersUseCase } from "./fetch-course-managers.ts";

let managersRepository: InMemoryManagersRepository
let coursesRepository: InMemoryCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let polesRepository: InMemoryPolesRepository
let managersCoursesRepository: InMemoryManagersCoursesRepository
let sut: FetchCourseManagersUseCase

describe(('Fetch Course Managers Use Case'), () => {
  beforeEach(() => {
    managersRepository = new InMemoryManagersRepository()
    coursesRepository = new InMemoryCoursesRepository()
    managersPolesRepository = new InMemoryManagersPolesRepository()
    polesRepository = new InMemoryPolesRepository()
    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    sut = new FetchCourseManagersUseCase(managersCoursesRepository, coursesRepository)
  })

  it ('should not be able to fetch course students if course does not exist', async () => {
    const result = await sut.execute({ courseId: 'not-found', page: 1, perPage: 0})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to fetch course managers', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole1 = makePole()
    const pole2 = makePole()
    const pole3 = makePole()
    polesRepository.createMany([pole1, pole2, pole3])

    const manager1 = makeManager()
    const manager2 = makeManager()
    const manager3 = makeManager()
    managersRepository.create(manager1)
    managersRepository.create(manager2)
    managersRepository.create(manager3)
    
    const managerCourse1 = makeManagerCourse({ courseId: course.id, managerId: manager1.id })
    const managerCourse2 = makeManagerCourse({ courseId: course.id, managerId: manager2.id })
    const managerCourse3 = makeManagerCourse({ courseId: course.id, managerId: manager3.id })

    managersCoursesRepository.create(managerCourse1)
    managersCoursesRepository.create(managerCourse2)
    managersCoursesRepository.create(managerCourse3)

    const managerPole1 = makeManagerPole({ poleId: pole1.id, managerId: managerCourse1.id })
    const managerPole2 = makeManagerPole({ poleId: pole2.id, managerId: managerCourse2.id })
    const managerPole3 = makeManagerPole({ poleId: pole3.id, managerId: managerCourse3.id })

    managersPolesRepository.create(managerPole1)
    managersPolesRepository.create(managerPole2)
    managersPolesRepository.create(managerPole3)

    const result = await sut.execute({ courseId: course.id.toValue(), page: 1, perPage: 6 })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      managers: [
        {
          username: manager1.username.value,
          courseId: course.id,
          course: course.name.value,
          poleId: pole1.id,
          pole: pole1.name.value
        },
        {
          username: manager2.username.value,
          courseId: course.id,
          course: course.name.value,
          poleId: pole2.id,
          pole: pole2.name.value
        },
        {
          username: manager3.username.value,
          courseId: course.id,
          course: course.name.value,
          poleId: pole3.id,
          pole: pole3.name.value
        },
      ]
    })
  })

  it ('should be able to paginated course managers', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    for (let i = 1; i <= 8; i++) {
      const manager = makeManager()
      const managerCourse = makeManagerCourse({ courseId: course.id, managerId: manager.id })
      const managerPole = makeManagerPole({ managerId: managerCourse.id, poleId: pole.id })
      managersRepository.create(manager)
      managersCoursesRepository.create(managerCourse)
      managersPolesRepository.create(managerPole)
    }

    const result = await sut.execute({ courseId: course.id.toValue(), page: 2, perPage: 6 })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      pages: 2,
      totalItems: 8
    })
  })
})