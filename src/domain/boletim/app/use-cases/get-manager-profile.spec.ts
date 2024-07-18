import { beforeEach, describe, expect, it } from "vitest";
import { GetManagerProfileUseCase } from "./get-manager-profile.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { InMemoryManagersRepository } from "test/repositories/in-memory-managers-repository.ts";
import { makeManager } from "test/factories/make-manager.ts";
import { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import { InMemoryManagersPolesRepository } from "test/repositories/in-memory-managers-poles-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { makeManagerCourse } from "test/factories/make-manager-course.ts";
import { makeManagerPole } from "test/factories/make-manager-pole.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makePole } from "test/factories/make-pole.ts";

let managersCoursesRepository: InMemoryManagersCoursesRepository
let coursesRepository: InMemoryCoursesRepository
let managersPolesRepository: InMemoryManagersPolesRepository
let polesRepository: InMemoryPolesRepository

let managersRepository: InMemoryManagersRepository
let sut: GetManagerProfileUseCase

describe('Get Manager Profile Use Case', () => {
  beforeEach (() => {
    coursesRepository = new InMemoryCoursesRepository()
    managersPolesRepository = new InMemoryManagersPolesRepository()
    polesRepository = new InMemoryPolesRepository()
    
    managersCoursesRepository = new InMemoryManagersCoursesRepository(
      managersRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    ) 

    managersRepository = new InMemoryManagersRepository(
      managersCoursesRepository,
      coursesRepository,
      managersPolesRepository,
      polesRepository
    )
    sut = new GetManagerProfileUseCase (
      managersRepository
    )
  })

  it ('should not be able to get manager profile does not exist', async () => {
    const result = await sut.execute({ id: 'not-found' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get manager profile', async () => {
    const manager = makeManager() 
    managersRepository.create(manager)

    const course = makeCourse()
    coursesRepository.create(course)
    
    const managerCourse = makeManagerCourse({ managerId: manager.id, courseId: course.id })
    managersCoursesRepository.create(managerCourse)

    const pole = makePole()
    polesRepository.create(pole)
    const managerPole = makeManagerPole({ managerId: managerCourse.id, poleId: pole.id })
    managersPolesRepository.create(managerPole)

    const result = await sut.execute({ id: manager.id.toValue() })
    
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      manager: {
        managerId: manager.id,
        courses: [
          {
            id: course.id
          }
        ],
        poles: [
          {
            id: pole.id
          }
        ]
      }
    })
  })
})