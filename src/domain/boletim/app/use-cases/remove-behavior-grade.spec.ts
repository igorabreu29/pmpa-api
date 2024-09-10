import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeBehavior } from "test/factories/make-behavior.ts";
import { UpdateBehaviorUseCaseUseCase } from "./update-behavior.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { RemoveBehaviorGradeUseCase } from "./remove-behavior-grade.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let behaviorsRepository: InMemoryBehaviorsRepository
let coursesRepository: InMemoryCoursesRepository
let studentsRepository: InMemoryStudentsRepository
let sut: RemoveBehaviorGradeUseCase

describe(('Remove Behavior Grade Use Case'), () => {
  beforeEach(() => {
    vi.useFakeTimers(),
    behaviorsRepository = new InMemoryBehaviorsRepository()
    coursesRepository = new InMemoryCoursesRepository()
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    behaviorsRepository = new InMemoryBehaviorsRepository()
    sut = new RemoveBehaviorGradeUseCase(behaviorsRepository)
  })

  it ('should not be able to update behavior if access level is student', async () => {
    const result = await sut.execute({
      id: '',
      userId: '',
      userIp: '',
      role: 'student',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
  
  it ('should not be able to remove grade if behavior does not exist', async () => {
    const result = await sut.execute({
      id: '',
      userId: '',
      userIp: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to remove grade', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const student = makeStudent()
    studentsRepository.create(student)

    const behavior = makeBehavior({ courseId: course.id, studentId: student.id, january: 10, february: 10 })
    behaviorsRepository.create(behavior)

    const result = await sut.execute({
      id: behavior.id.toValue(),
      january: -1,
      userId: '',
      userIp: '',
      role: 'dev'
    })

    expect(result.isRight()).toBe(true)
    expect(behaviorsRepository.items[0]).toMatchObject({
      january: null,
      february: 10
    })
  })
})