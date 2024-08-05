import { InMemoryCoursesDisciplinesRepository } from 'test/repositories/in-memory-courses-disciplines-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryDisciplinesRepository } from 'test/repositories/in-memory-disciplines-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { CreateCourseDisciplineUseCase } from './create-course-discipline.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeDiscipline } from 'test/factories/make-discipline.ts'
import { makeCourseDiscipline } from 'test/factories/make-course-discipline.ts'
import { ResourceAlreadyExistError } from '@/core/errors/use-case/resource-already-exist-error.ts'

let coursesRepository: InMemoryCoursesRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let courseDisciplineRepository: InMemoryCoursesDisciplinesRepository
let sut: CreateCourseDisciplineUseCase

describe('Create Course Discipline', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()
    courseDisciplineRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository
    )
    sut = new CreateCourseDisciplineUseCase(
      coursesRepository,
      disciplinesRepository,
      courseDisciplineRepository
    )
  })

  it ('should not be able to create course discipline if course not found.', async () => {
    const result = await sut.execute({
      courseId: '',
      disciplineId: '',
      expected: 'VF',
      hours: 0,
      module: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create course discipline if discipline not found.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      disciplineId: '',
      expected: 'VF',
      hours: 0,
      module: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create course discipline if discipline already be present in the course.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const courseDiscipline = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline.id })
    courseDisciplineRepository.create(courseDiscipline)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue(),
      expected: 'VF',
      hours: 0,
      module: 0
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create course discipline.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue(),
      expected: 'VF',
      hours: 0,
      module: 0
    })

    expect(result.isRight()).toBe(true)
    expect(courseDisciplineRepository.items[0].id).toBeTruthy()
  })
})