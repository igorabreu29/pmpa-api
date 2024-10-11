import { InMemoryCoursesDisciplinesRepository } from 'test/repositories/in-memory-courses-disciplines-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryDisciplinesRepository } from 'test/repositories/in-memory-disciplines-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { CreateCourseDisciplineUseCase } from './create-course-discipline.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeDiscipline } from 'test/factories/make-discipline.ts'
import { makeCourseDiscipline } from 'test/factories/make-course-discipline.ts'
import { DeleteCourseDisciplineUseCase } from './delete-course-discipline.ts'
import { InMemoryAssessmentsRepository } from 'test/repositories/in-memory-assessments-repository.ts'
import { makeAssessment } from 'test/factories/make-assessment.ts'

let assessmentsRepository: InMemoryAssessmentsRepository

let coursesRepository: InMemoryCoursesRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let courseDisciplineRepository: InMemoryCoursesDisciplinesRepository
let sut: DeleteCourseDisciplineUseCase

describe('Delete Course Discipline', () => {
  beforeEach(() => {
    assessmentsRepository = new InMemoryAssessmentsRepository()

    coursesRepository = new InMemoryCoursesRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()
    courseDisciplineRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository,
      assessmentsRepository
    )
    sut = new DeleteCourseDisciplineUseCase(
      coursesRepository,
      disciplinesRepository,
      courseDisciplineRepository
    )
  })

  it ('should not be able to delete course discipline if course does not exist', async () => {
    const result = await sut.execute({
      courseId: '',
      disciplineId: '',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to delete course discipline if discipline does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      disciplineId: '',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to delete course discipline if discipline is not present in the course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to delete course discipline.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const courseDiscipline = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline.id })
    courseDisciplineRepository.create(courseDiscipline)

    const assessment = makeAssessment({ courseId: course.id, disciplineId: discipline.id })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(courseDisciplineRepository.items).toHaveLength(0)
    expect(assessmentsRepository.items).toHaveLength(0)
  })
})