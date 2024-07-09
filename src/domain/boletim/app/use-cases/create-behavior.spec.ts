import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { CreateBehaviorUseCase } from "./create-behavior.ts";
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import { makeBehavior } from "test/factories/make-behavior.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryUsersCourseRepository } from "test/repositories/in-memory-users-course-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { ConflictError } from "./errors/conflict-error.ts";

let behaviorsRepository: InMemoryBehaviorsRepository
let usersCoursesRepository: InMemoryUsersCourseRepository
let coursesRepository: InMemoryCoursesRepository
let sut: CreateBehaviorUseCase

describe(('Create Behavior Use Case'), () => {
  beforeEach(() => {
    vi.useFakeTimers()

    behaviorsRepository = new InMemoryBehaviorsRepository()
    usersCoursesRepository = new InMemoryUsersCourseRepository()
    coursesRepository = new InMemoryCoursesRepository ()
    sut = new CreateBehaviorUseCase(
      behaviorsRepository,
      coursesRepository
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it ('should not be able to create behavior if course does not exist', async () => {
    const result = await sut.execute({
      studentId: 'student-1',
      courseId: 'course-1',
      poleId: '',
      currentYear: 2025
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create behavior if course has been finished', async () => {
    vi.setSystemTime(new Date('2023-1-5'))

    const course = makeCourse({ endsAt: new Date('2022') })
    coursesRepository.create(course)

    const result = await sut.execute({
      studentId: 'student-1',
      courseId: course.id.toValue(),
      poleId: '',
      currentYear: 2025
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to create behavior if already be added', async () => {
    const behavior = makeBehavior()
    behaviorsRepository.create(behavior)

    const result = await sut.execute({
      studentId: behavior.studentId.toValue(),
      courseId: behavior.courseId.toValue(),
      poleId: '',
      currentYear: behavior.currentYear
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to create behavior', async () => {
    vi.setSystemTime(new Date('2023-1-5'))

    const course = makeCourse({ endsAt: new Date('2025') })
    coursesRepository.create(course)

    const result = await sut.execute({
      studentId: 'user-1',
      courseId: course.id.toValue(),
      poleId: 'pole-1',
      currentYear: new Date().getFullYear()
    })

    expect(result.isRight()).toBe(true)
    expect(behaviorsRepository.items).toHaveLength(1)
  })
})