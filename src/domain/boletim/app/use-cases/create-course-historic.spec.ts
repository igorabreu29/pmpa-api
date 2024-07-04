import { describe, it, expect, beforeEach } from 'vitest'
import { CreateCourseHistoricUseCase } from './create-course-historic.ts'
import { InMemoryCourseHistoricRepository } from 'test/repositories/in-memory-course-historic-repository.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { ConflictError } from './errors/conflict-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { InMemoryUsersCourseRepository } from 'test/repositories/in-memory-users-course-repository.ts'

let usersCoursesRepository: InMemoryUsersCourseRepository
let coursesRepository: InMemoryCoursesRepository
let courseHistoricRepository: InMemoryCourseHistoricRepository
let sut: CreateCourseHistoricUseCase

describe('Create Course Historic Use Case', () => {
  beforeEach(() => {
    usersCoursesRepository = new InMemoryUsersCourseRepository()
    coursesRepository = new InMemoryCoursesRepository(
      usersCoursesRepository
    )
    courseHistoricRepository = new InMemoryCourseHistoricRepository()
    sut = new CreateCourseHistoricUseCase(
      coursesRepository,
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
    expect(result.value?.message).toEqual('Course not found.')
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
    expect(result.value?.message).toEqual('Conflict between dates. Finish Date cannot be less than Start Date.')
  }) 

  it('should be able to create course historic', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(), 
      className: 'CFP - 2022',
      startDate: new Date(2024, 2, 12),
      finishDate: new Date(2025, 5, 12),
    })

    expect(result.isRight()).toBe(true)
    expect(courseHistoricRepository.items).toHaveLength(1)
    expect(courseHistoricRepository.items[0].id).toBeTruthy()
  }) 
})