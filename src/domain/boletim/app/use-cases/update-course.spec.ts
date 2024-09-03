import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { UpdateCourseUseCase } from "./update-course.ts";
import { InvalidNameError } from "@/core/errors/domain/invalid-name.ts";

let coursesRepository: InMemoryCoursesRepository
let sut: UpdateCourseUseCase

describe('Update Course Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    sut = new UpdateCourseUseCase(
      coursesRepository
    )
  })

  it ('should not be able to update course if it does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update course if name is invalid', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      id: course.id.toValue(),
      name: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidNameError)
  })

  it ('should be able to update course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      id: course.id.toValue(),
      name: 'course-1'
    })

    expect(result.isRight()).toBe(true)
    expect(coursesRepository.items[0].name.value).toEqual('course-1')
  })
})