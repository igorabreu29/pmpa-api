import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { ResourceAlreadyExistError } from '@/core/errors/use-case/resource-already-exist-error.ts'
import { InMemoryCoursesPolesRepository } from 'test/repositories/in-memory-courses-poles-repository.ts'
import { CreateCoursePoleUseCase } from './create-course-pole.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeCoursePole } from 'test/factories/make-course-pole.ts'

let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let coursesPolesReposiry: InMemoryCoursesPolesRepository
let sut: CreateCoursePoleUseCase

describe('Create Course Pole', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    coursesPolesReposiry = new InMemoryCoursesPolesRepository(
      polesRepository
    )
    sut = new CreateCoursePoleUseCase(
      coursesRepository,
      polesRepository,
      coursesPolesReposiry
    )
  })

  it ('should not be able to create course discipline if course not found.', async () => {
    const result = await sut.execute({
      courseId: '',
      poleId: '',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create course pole if pole not found.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: '',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create course pole if pole already be present in the course.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const coursePoleRepository = makeCoursePole({ courseId: course.id, poleId: pole.id})
    coursesPolesReposiry.create(coursePoleRepository)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue()
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create course pole.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(coursesPolesReposiry.items[0].id).toBeTruthy()
  })
})