import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { CreateBehaviorUseCase } from "./create-behavior.ts";
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import { makeBehavior } from "test/factories/make-behavior.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { EndsAt } from "../../enterprise/entities/value-objects/ends-at.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { makePole } from "test/factories/make-pole.ts";
import { makeStudent } from "test/factories/make-student.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository

let behaviorsRepository: InMemoryBehaviorsRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository
let studentsRepository: InMemoryStudentsRepository
let sut: CreateBehaviorUseCase

describe(('Create Behavior Use Case'), () => {
  beforeEach(() => {
    vi.useFakeTimers()

    behaviorsRepository = new InMemoryBehaviorsRepository()
    coursesRepository = new InMemoryCoursesRepository ()
    polesRepository = new InMemoryPolesRepository()
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    sut = new CreateBehaviorUseCase(
      behaviorsRepository,
      coursesRepository,
      polesRepository,
      studentsRepository
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it ('should not be able to create behavior if course does not exist', async () => {
    const result = await sut.execute({
      studentId: '',
      courseId: 'not-found',
      poleId: '',
      currentYear: 2025,
      userIp: '',
      userId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
  
  it ('should not be able to create behavior if pole does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      studentId: 'student-1',
      courseId: course.id.toValue(),
      poleId: '',
      currentYear: 2025,
      userIp: '',
      userId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create behavior if student does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const result = await sut.execute({
      studentId: 'student-1',
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      currentYear: 2025,
      userIp: '',
      userId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create behavior if course has been finished', async () => {
    vi.setSystemTime(new Date('2023-1-5'))

    const endsAtOrError = EndsAt.create(new Date('2023-1-4'))
    if (endsAtOrError.isLeft()) return

    const course = makeCourse({ endsAt: endsAtOrError.value })
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({
      studentId: student.id.toValue(),
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      currentYear: 2025,
      userIp: '',
      userId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to create behavior if already be added', async () => {
    const behavior = makeBehavior()
    behaviorsRepository.create(behavior)

    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({
      studentId: behavior.studentId.toValue(),
      courseId: behavior.courseId.toValue(),
      poleId: '',
      currentYear: behavior.currentYear,
      userIp: '',
      userId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to create behavior', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()
    polesRepository.create(pole)

    const student = makeStudent()
    studentsRepository.create(student)


    const result = await sut.execute({
      studentId: student.id.toValue(),
      courseId: course.id.toValue(),
      poleId: pole.id.toValue(),
      currentYear: new Date().getFullYear(),
      userIp: '',
      userId: 'manager-1'
    })

    expect(result.isRight()).toBe(true)
    expect(behaviorsRepository.items).toHaveLength(1)
  })
})