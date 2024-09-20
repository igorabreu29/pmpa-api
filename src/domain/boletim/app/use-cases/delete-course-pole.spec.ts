import { InMemoryCoursesPolesRepository } from 'test/repositories/in-memory-courses-poles-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeCoursePole } from 'test/factories/make-course-pole.ts'
import { DeleteCoursePoleUseCase } from './delete-course-pole.ts'

let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let coursePoleRepository: InMemoryCoursesPolesRepository
let sut: DeleteCoursePoleUseCase

describe('Delete Course Pole', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    coursePoleRepository = new InMemoryCoursesPolesRepository(
      polesRepository
    )
    sut = new DeleteCoursePoleUseCase(
      coursesRepository,
      polesRepository,
      coursePoleRepository
    )
  })

  it ('should not be able to delete course pole if course does not exist', async () => {
    const result = await sut.execute({
      courseId: '',
      poleId: '',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to delete course pole if pole does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: '',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to delete course pole if pole is not present in the course', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to delete course pole.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const coursePole = makeCoursePole({ courseId: course.id, poleId: pole.id })
    coursePoleRepository.create(coursePole)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(coursePoleRepository.items).toHaveLength(0)
  })
})