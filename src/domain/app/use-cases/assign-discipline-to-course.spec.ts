import { Expected } from "@/domain/enterprise/entities/course-discipline.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { AssignDisicplineToCourseUseCase } from "./assign-discipline-to-course.ts";
import { InMemoryCourseDisciplineRepository } from "test/repositories/in-memory-course-discipline-repository.ts";
import { makeCourseDiscipline } from "test/factories/make-course-discipline.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { makeCourse } from "test/factories/make-course.ts";

let courseDisciplineRepository: InMemoryCourseDisciplineRepository
let sut: AssignDisicplineToCourseUseCase

const defaultParams = {
  expected: 'VF' as Expected,
  hours: 30,
  module: 1,
  weight: 1
}

describe('Assign Disicpline To Course Use Case', () => {
  beforeEach(() => {
    courseDisciplineRepository = new InMemoryCourseDisciplineRepository()
    sut = new AssignDisicplineToCourseUseCase(courseDisciplineRepository)
  })

  it ('should not be able to assign disicpline to the course if already be present', async () => {
    const discipline = makeDiscipline()
    const course = makeCourse()

    const courseDiscipline = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline.id })
    courseDisciplineRepository.create(courseDiscipline)

    const result = await sut.execute({
      courseId: courseDiscipline.courseId.toValue(),
      disciplineId: courseDiscipline.disciplineId.toValue(),
      expected: courseDiscipline.expected,
      hours: courseDiscipline.hours,
      module: courseDiscipline.module,
      weight: courseDiscipline.weight
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to assign disciple to the course', async () => {
    const discipline = makeDiscipline()
    const course = makeCourse()

    const result = await sut.execute({
      disciplineId: discipline.id.toValue(),
      courseId: course.id.toValue(),
      ...defaultParams
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toBeNull()
    expect(courseDisciplineRepository.items).toHaveLength(1)
  })
})