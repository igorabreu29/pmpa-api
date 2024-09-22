import { FakeHasher } from "test/cryptography/fake-hasher.ts";
import { InMemoryCourseHistoricRepository } from "test/repositories/in-memory-course-historic-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { ValidateHistoricUseCase } from "./validate-historic.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourseHistoric } from "test/factories/make-course-historic.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { ConflictError } from "./errors/conflict-error.ts";

let coursesRepository: InMemoryCoursesRepository
let courseHistoricsRepository: InMemoryCourseHistoricRepository
let hasher: FakeHasher
let sut: ValidateHistoricUseCase

describe('Validate Historic Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    courseHistoricsRepository = new InMemoryCourseHistoricRepository()
    hasher = new FakeHasher()
    sut = new ValidateHistoricUseCase(
      coursesRepository,
      courseHistoricsRepository,
      hasher
    )
  })

  it ('should not be able to validate historic if course historic does not exist', async () => {
    const result = await sut.execute({
      id: 'not-found',
      hash: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to validate historic if course does not exist', async () => {
    const courseHistoric = makeCourseHistoric()
    courseHistoricsRepository.create(courseHistoric)

    const result = await sut.execute({
      id: courseHistoric.id.toValue(),
      hash: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to validate historic if hash is not equals', async () => {
    const course = makeCourse()
    coursesRepository.create(course)
    
    const courseHistoric = makeCourseHistoric({ courseId: course.id })
    courseHistoricsRepository.create(courseHistoric)

    const result = await sut.execute({
      id: courseHistoric.id.toValue(),
      hash: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should be able to validate historic', async () => {
    const course = makeCourse()
    coursesRepository.create(course)
    
    const courseHistoric = makeCourseHistoric({ courseId: course.id })
    courseHistoricsRepository.create(courseHistoric)

    const result = await sut.execute({
      id: courseHistoric.id.toValue(),
      hash: `${course.name.value} - PMPA-hasher`
    })

    expect(result.isRight()).toBe(true)
  })
})