import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { CreateCourseUseCase } from "./create-course.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { InMemoryCoursesPolesRepository } from "test/repositories/in-memory-courses-poles-repository.ts";
import { InMemoryCoursesDisciplinesRepository } from "test/repositories/in-memory-courses-disciplines-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";

let polesRepositoy: InMemoryPolesRepository

let coursesRepository: InMemoryCoursesRepository
let coursesPolesRepository: InMemoryCoursesPolesRepository
let coursesDisciplinesRepository: InMemoryCoursesDisciplinesRepository
let sut: CreateCourseUseCase

describe('Create Course Use Case', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    
    polesRepositoy = new InMemoryPolesRepository()

    coursesRepository = new InMemoryCoursesRepository()
    coursesPolesRepository = new InMemoryCoursesPolesRepository(
      polesRepositoy
    )
    coursesDisciplinesRepository = new InMemoryCoursesDisciplinesRepository()
    sut = new CreateCourseUseCase(
      coursesRepository,
      coursesPolesRepository,
      coursesDisciplinesRepository
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it ('should not be able to course user with name already exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      formula: course.formula, 
      imageUrl: course.imageUrl, 
      name: course.name.value, 
      endsAt: new Date(), 
      disciplines: [], 
      poleIds: [], 
      isPeriod: false 
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create course', async () => {
    vi.setSystemTime('2022-1-2')

    const result = await sut.execute({ 
      formula: 'CAS', 
      imageUrl: 'random-url', 
      name: 'CFP - 2024', 
      endsAt: new Date('2023'),
      isPeriod: false,
      disciplines: [
        {
          id: 'discipline-1',
          expected: 'VF',
          hours: 30,
          module: 1
        }
      ], 
      poleIds: ['pole-1', 'pole-2'] 
    })

    expect(result.isRight()).toBe(true)
    expect(coursesRepository.items).toHaveLength(1)
    expect(coursesDisciplinesRepository.items).toHaveLength(1)
    expect(coursesPolesRepository.items).toHaveLength(2)
  })
})