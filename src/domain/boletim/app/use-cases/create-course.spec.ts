import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { CreateCourseUseCase } from "./create-course.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";

let coursesRepository: InMemoryCoursesRepository
let sut: CreateCourseUseCase

describe('Create Course Use Case', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    
    coursesRepository = new InMemoryCoursesRepository()
    sut = new CreateCourseUseCase(
      coursesRepository,
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
    })

    expect(result.isRight()).toBe(true)
    expect(coursesRepository.items).toHaveLength(1)
  })
})