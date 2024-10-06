import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { InMemoryCoursesDisciplinesRepository } from "test/repositories/in-memory-courses-disciplines-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { FetchCourseAssessmentsUseCase } from "./fetch-course-assessments.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { makeCourseDiscipline } from "test/factories/make-course-discipline.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";

let coursesRepository: InMemoryCoursesRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository
let assessmentsRepository: InMemoryAssessmentsRepository

let sut: FetchCourseAssessmentsUseCase

describe('Fetch Course Assessments Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()
    courseDisciplinesRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository
    )
    assessmentsRepository = new InMemoryAssessmentsRepository()

    sut = new FetchCourseAssessmentsUseCase(
      coursesRepository,
      disciplinesRepository,
      courseDisciplinesRepository,
      assessmentsRepository
    )
  })

  it ('should not be able to fetch course assessments if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found',
      disciplineId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to fetch course assessments if discipline does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)
      
    const result = await sut.execute({
      courseId: course.id.toValue(),
      disciplineId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to fetch course assessments if course discipline does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)
      
    const result = await sut.execute({
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue()
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to fetch course assessments', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const courseDiscipline = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline.id })
    courseDisciplinesRepository.create(courseDiscipline)

    const assessment = makeAssessment({ courseId: course.id, disciplineId: discipline.id })
    const assessment2 = makeAssessment({ courseId: course.id, disciplineId: discipline.id })
    assessmentsRepository.createMany([assessment, assessment2])

    const result = await sut.execute({
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      assessments: [
        {
          courseId: course.id,
          disciplineId: discipline.id,
        },
        {
          courseId: course.id,
          disciplineId: discipline.id,
        },
      ]
    })
  })
})