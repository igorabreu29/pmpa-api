import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { FetchCourseBehaviorsUseCase } from "./fetch-course-behaviors.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeBehavior } from "test/factories/make-behavior.ts";

let coursesRepository: InMemoryCoursesRepository
let behaviorsRepository: InMemoryBehaviorsRepository

let sut: FetchCourseBehaviorsUseCase

describe('Fetch Course Behaviors Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()

    sut = new FetchCourseBehaviorsUseCase(
      coursesRepository,
      behaviorsRepository
    )
  })

  it ('should not be able to fetch course behaviors if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to fetch course behaviors', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const behavior = makeBehavior({ courseId: course.id })
    const behavior2 = makeBehavior({ courseId: course.id })
    behaviorsRepository.create(behavior)
    behaviorsRepository.create(behavior2)

    const result = await sut.execute({
      courseId: course.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      behaviors: [
        {
          id: behavior.id
        },
        {
          id: behavior2.id
        }
      ]
    })
  })
})