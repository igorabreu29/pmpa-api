import { describe, it, expect, beforeEach } from 'vitest'
import { CreateCourseHistoricUseCase } from './create-course-historic.ts'
import { InMemoryCourseHistoricRepository } from 'test/repositories/in-memory-course-historic-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { ConflictError } from './errors/conflict-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { ResourceAlreadyExistError } from '@/core/errors/use-case/resource-already-exist-error.ts'
import { makeCourseHistoric } from 'test/factories/make-course-historic.ts'
import { InMemoryCoursesDisciplinesRepository } from 'test/repositories/in-memory-courses-disciplines-repository.ts'
import type { DisciplinesRepository } from '../repositories/disciplines-repository.ts'
import { InMemoryDisciplinesRepository } from 'test/repositories/in-memory-disciplines-repository.ts'
import { makeDiscipline } from 'test/factories/make-discipline.ts'
import { makeCourseDiscipline } from 'test/factories/make-course-discipline.ts'

let disciplinesRepository: InMemoryDisciplinesRepository

let coursesRepository: InMemoryCoursesRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository
let courseHistoricRepository: InMemoryCourseHistoricRepository
let sut: CreateCourseHistoricUseCase

describe('Create Course Historic Use Case', () => {
  beforeEach(() => {
    disciplinesRepository = new InMemoryDisciplinesRepository()

    coursesRepository = new InMemoryCoursesRepository()
    courseDisciplinesRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository
    )
    courseHistoricRepository = new InMemoryCourseHistoricRepository()
    sut = new CreateCourseHistoricUseCase(
      coursesRepository,
      courseDisciplinesRepository,
      courseHistoricRepository
    )
  })

  it ('should not be able to create course historic if course not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-exist', 
      className: 'CFP - 2022',
      startDate: new Date(2023, 2, 10),
      finishDate: new Date(2025, 5, 12),
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  }) 

  it ('should not be able to create course historic if it aldready has one', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const courseHistoric = makeCourseHistoric({ courseId: course.id })
    courseHistoricRepository.create(courseHistoric)

    const result = await sut.execute({
      courseId: course.id.toValue(), 
      className: 'CFP - 2022',
      startDate: new Date('2022-01-02'),
      finishDate: new Date('2022-02-02')
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should not be able to create course historic if finish date is less than start date', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(), 
      className: 'CFP - 2022',
      startDate: new Date(2024, 0, 12),
      finishDate: new Date(2023, 0, 12)
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
    expect(result.value?.message).toEqual('Conflito entre a data de início e de fim!')
  }) 

  it('should be able to create course historic', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const courseDiscipline = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline.id, hours: 10 })
    courseDisciplinesRepository.create(courseDiscipline)

    const result = await sut.execute({
      courseId: course.id.toValue(), 
      className: 'CFP - 2022',
      startDate: new Date(2024, 2, 12),
      finishDate: new Date(2025, 5, 12),
      speechs: 10,
      internships: 10
    })

    expect(result.isRight()).toBe(true)
    expect(courseHistoricRepository.items).toHaveLength(1)
    expect(courseHistoricRepository.items[0].id).toBeTruthy()
    expect(courseHistoricRepository.items[0].totalHours).toEqual(30)
  }) 
})