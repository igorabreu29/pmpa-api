import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateAssessmentUseCase } from "./create-assessment.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryUsersCourseRepository } from "test/repositories/in-memory-users-course-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";

let assessmentsRepository: InMemoryAssessmentsRepository
let coursesRepository: InMemoryCoursesRepository
let usersCoursesRepository: InMemoryUsersCourseRepository
let sut: CreateAssessmentUseCase

describe(('Create Assessment Use Case'), () => {
  beforeEach(() => {
    vi.useFakeTimers(),
    assessmentsRepository = new InMemoryAssessmentsRepository()
    usersCoursesRepository = new InMemoryUsersCourseRepository()
    coursesRepository = new InMemoryCoursesRepository(
      usersCoursesRepository
    )
    sut = new CreateAssessmentUseCase(
      assessmentsRepository,
      coursesRepository
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it ('should not be able to create assessment if course does not exist', async () => {
    const assessment = makeAssessment()
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      studentId: assessment.studentId.toValue(),
      courseId: assessment.courseId.toValue(),
      poleId: '',
      disciplineId: '',
      vf: 2,
      vfe: null,
      avi: null,
      avii: null,
      userIP: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create assessment if course has been finished', async () => {
    vi.setSystemTime(new Date(2022, 1, 5))

    const course = makeCourse({ endsAt: new Date(2021, 1, 2) })
    coursesRepository.create(course)

    const assessment = makeAssessment({ courseId: course.id })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      studentId: assessment.studentId.toValue(),
      courseId: assessment.courseId.toValue(),
      poleId: '',
      disciplineId: '',
      vf: 2,
      vfe: null,
      avi: null,
      avii: null,
      userIP: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to create assessment if already be added', async () => {
    vi.setSystemTime(new Date(2022, 1, 5))

    const course = makeCourse({ endsAt: new Date(2023, 1, 2) })
    coursesRepository.create(course)

    const assessment = makeAssessment({ courseId: course.id })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      studentId: assessment.studentId.toValue(),
      courseId: assessment.courseId.toValue(),
      poleId: '',
      disciplineId: '',
      vf: 2,
      vfe: null,
      avi: null,
      avii: null,
      userIP: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create asssessment if avi is less than 0', async () => {
    vi.setSystemTime(new Date(2022, 1, 5))

    const course = makeCourse({ endsAt: new Date(2023, 1, 2) })
    coursesRepository.create(course)

    const result = await sut.execute({
      studentId: 'user-1',
      courseId: course.id.toValue(),
      poleId: 'pole-1',
      disciplineId: 'discipline-1',
      vf: 5,
      avi: -1,
      avii: null,
      vfe: null,
      userIP: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to create asssessment if avii is less than 0', async () => {
    vi.setSystemTime(new Date(2022, 1, 5))

    const course = makeCourse({ endsAt: new Date(2023, 1, 2) })
    coursesRepository.create(course)

    const result = await sut.execute({
      studentId: 'user-1',
      courseId: course.id.toValue(),
      poleId: 'pole-1',
      disciplineId: 'discipline-1',
      vf: 5,
      avi: 5,
      avii: -1,
      vfe: null,
      userIP: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to create asssessment if vfe is less than 0', async () => {
    vi.setSystemTime(new Date(2022, 1, 5))

    const course = makeCourse({ endsAt: new Date(2023, 1, 2) })
    coursesRepository.create(course)

    const result = await sut.execute({
      studentId: 'user-1',
      courseId: course.id.toValue(),
      poleId: 'pole-1',
      disciplineId: 'discipline-1',
      vf: 5,
      avi: null,
      avii: null,
      vfe: -1,
      userIP: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to create asssessment if avii has been passed and avi has not passed', async () => {
    vi.setSystemTime(new Date(2022, 1, 5))

    const course = makeCourse({ endsAt: new Date(2023, 1, 2) })
    coursesRepository.create(course)

    const result = await sut.execute({
      studentId: 'user-1',
      courseId: course.id.toValue(),
      poleId: 'pole-1',
      disciplineId: 'discipline-1',
      vf: 5,
      avi: null,
      avii: 10,
      vfe: null,
      userIP: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should be able to create assessment', async () => {
    vi.setSystemTime(new Date(2022, 1, 5))

    const course = makeCourse({ endsAt: new Date(2023, 1, 2) })
    coursesRepository.create(course)

    const result = await sut.execute({
      studentId: 'user-1',
      courseId: course.id.toValue(),
      poleId: 'pole-1',
      disciplineId: 'discipline-1',
      vf: 5,
      vfe: null,
      avi: null,
      avii: null,
      userIP: ''
    })

    expect(result.isRight()).toBe(true)
    expect(assessmentsRepository.items).toHaveLength(1)
  })
})