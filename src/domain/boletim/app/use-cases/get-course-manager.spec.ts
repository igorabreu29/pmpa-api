import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { makePole } from "test/factories/make-pole.ts";
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts";
import { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import { InMemoryManagersPolesRepository } from "test/repositories/in-memory-managers-poles-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { makeManager } from "test/factories/make-manager.ts";
import { makeManagerCourse } from "test/factories/make-manager-course.ts";
import { makeManagerPole } from "test/factories/make-manager-pole.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { Name } from "../../enterprise/entities/value-objects/name.ts";
import { GetCourseManagerUseCase } from "./get-course-manager.ts";

let managersCoursesRepository: InMemoryManagersCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let managersRepository: InMemoryManagersRepository
let sut: GetCourseManagerUseCase

describe(('Get Course Manager Use Case'), () => {
  beforeEach(() => {
    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    
    coursesRepository = new InMemoryCoursesRepository()
    managersPolesRepository = new InMemoryManagersPolesRepository()
    polesRepository = new InMemoryPolesRepository()
    managersCoursesRepository = new InMemoryManagersCoursesRepository (
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )

    sut = new GetCourseManagerUseCase(coursesRepository, managersCoursesRepository)
  })

  it ('should not be able to get course managers if course does not exist', async () => {
    const result = await sut.execute({ courseId: 'not-found', id: ''})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to get course managers if manager is not present in the course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({ courseId: course.id.toValue(), id: 'not-found'})

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get course manager', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const manager = makeManager()
    managersRepository.create(manager)
    
    const managerCourse = makeManagerCourse({ courseId: course.id, managerId: manager.id })
    const managerPole = makeManagerPole({ poleId: pole.id, managerId: managerCourse.id })
    managersCoursesRepository.create(managerCourse)
    managersPolesRepository.create(managerPole)

    const result = await sut.execute({ courseId: course.id.toValue(), id: manager.id.toValue() })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      manager: {
        managerId: manager.id,
        username: manager.username.value,
        course: course.name.value,
        courseId: course.id,
        pole: pole.name.value,
        poleId: pole.id,
      }
    })
  })
})