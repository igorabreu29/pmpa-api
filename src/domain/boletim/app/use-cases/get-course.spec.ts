import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { GetCourseUseCase } from "./get-course.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourse } from "test/factories/make-course.ts";

let coursesRepository: InMemoryCoursesRepository
let sut: GetCourseUseCase

describe('Get Course Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    sut = new GetCourseUseCase(
      coursesRepository
    )
  })

  it ('should not be able to get course not existing', async () => {
    const result = await sut.execute({
      id: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to get course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      id: course.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      course
    })
  })
})