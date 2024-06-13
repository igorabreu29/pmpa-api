import { beforeEach, describe, expect, it } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { AssignPoleToCourseUseCase } from "./assign-pole-to-course.ts";
import { makePole } from "test/factories/make-pole.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { InMemoryCoursePolesRepository } from "test/repositories/in-memory-course-poles-repository.ts";
import { makeCoursePole } from "test/factories/make-course-pole.ts";

let poleCourseRepository: InMemoryCoursePolesRepository
let sut: AssignPoleToCourseUseCase

describe('Assign Pole To Course Use Case', () => {
  beforeEach(() => {
    poleCourseRepository = new InMemoryCoursePolesRepository()
    sut = new AssignPoleToCourseUseCase(poleCourseRepository)
  })

  it ('should not be able to assign pole to the course if already be present', async () => {
    const pole = makePole()
    const course = makeCourse()
    
    const poleCourse = makeCoursePole({ courseId: course.id, poleId: pole.id })
    poleCourseRepository.create(poleCourse)

    const result = await sut.execute({
      courseId: poleCourse.courseId.toValue(),
      poleId: poleCourse.poleId.toValue()
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to assign pole to the course', async () => {
    const pole = makePole()
    const course = makeCourse()

    const result = await sut.execute({
      poleId: pole.id.toValue(),
      courseId: course.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toBeNull()
    expect(poleCourseRepository.items).toHaveLength(1)
  })
})