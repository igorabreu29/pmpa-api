import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { DeleteCourseUseCase } from "./delete-course.ts";

let coursesRepository: InMemoryCoursesRepository
let sut: DeleteCourseUseCase

describe('Delete Course Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    sut = new DeleteCourseUseCase(
      coursesRepository
    )
  })

  it ('should not be able to delete course if it does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to delete course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      id: course.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(coursesRepository.items).toHaveLength(0)
  })
})