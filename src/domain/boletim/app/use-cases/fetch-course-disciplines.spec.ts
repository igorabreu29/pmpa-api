import { InMemoryCoursesDisciplinesRepository } from 'test/repositories/in-memory-courses-disciplines-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryDisciplinesRepository } from 'test/repositories/in-memory-disciplines-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { FetchCourseDisciplinesUseCase } from './fetch-course-disciplines.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeDiscipline } from 'test/factories/make-discipline.ts'
import { makeCourseDiscipline } from 'test/factories/make-course-discipline.ts'
import { Name } from '../../enterprise/entities/value-objects/name.ts'

let disciplinesRepository: InMemoryDisciplinesRepository

let coursesRepository: InMemoryCoursesRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository
let sut: FetchCourseDisciplinesUseCase

describe('Fetch Course Disciplines Use Case', () => {
  beforeEach(() => {
    disciplinesRepository = new InMemoryDisciplinesRepository()
    coursesRepository = new InMemoryCoursesRepository()
    courseDisciplinesRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository
    )
    sut = new FetchCourseDisciplinesUseCase(
      coursesRepository,
      courseDisciplinesRepository
    )
  })

  it ('should not be able to fetch course disciplines if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to fetch course disciplines', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    const discipline2 = makeDiscipline()
    disciplinesRepository.createMany([discipline, discipline2])

    const courseDiscipline = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline.id })
    const courseDiscipline2 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline2.id })
    courseDisciplinesRepository.createMany([courseDiscipline, courseDiscipline2])

    const result = await sut.execute({
      courseId: course.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      disciplines: [
        {
          courseId: course.id,
          disciplineId: discipline.id,
        },
        {
          courseId: course.id,
          disciplineId: discipline2.id,
        },
      ]
    })
  })
  
  it ('should not be able to fetch course disciplines with search filtering', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const nameOrError = Name.create('discipline-1')
    if (nameOrError.isLeft()) return

    const discipline = makeDiscipline({ name: nameOrError.value })
    const discipline2 = makeDiscipline()
    disciplinesRepository.createMany([discipline, discipline2])

    const courseDiscipline = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline.id })
    const courseDiscipline2 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline2.id })
    courseDisciplinesRepository.createMany([courseDiscipline, courseDiscipline2])

    const result = await sut.execute({
      courseId: course.id.toValue(),
      search: 'discipline'
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      disciplines: [
        {
          courseId: course.id,
          disciplineId: discipline.id,
        },
      ]
    })
  })
})