import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeBehavior } from "test/factories/make-behavior.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { InMemoryBehaviorsBatchRepository } from "test/repositories/in-memory-behaviors-batch-repository.ts";
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EndsAt } from "../../enterprise/entities/value-objects/ends-at.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { CPF } from "../../enterprise/entities/value-objects/cpf.ts";
import { RemoveBehaviorsGradeBatchUseCase } from "./remove-behaviors-grade-batch.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository

let behaviorsRepository: InMemoryBehaviorsRepository
let studentsRepository: InMemoryStudentsRepository
let behaviorsBatchRepository: InMemoryBehaviorsBatchRepository
let sut: RemoveBehaviorsGradeBatchUseCase

describe('Remove Behaviors Grade Batch Use Case', () => {
  beforeEach(() => {
    vi.useFakeTimers()

    studentsCoursesRepository = new InMemoryStudentsCoursesRepository (
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository,
    )
    polesRepository = new InMemoryPolesRepository()    
  
    coursesRepository = new InMemoryCoursesRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()
    behaviorsBatchRepository = new InMemoryBehaviorsBatchRepository(
      behaviorsRepository
    )

    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    sut = new RemoveBehaviorsGradeBatchUseCase(
      behaviorsRepository,
      coursesRepository,
      studentsRepository,
      behaviorsBatchRepository
    )
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  it ('should not be able to remove behaviors grade if user access is student', async () => {
    const result = await sut.execute({ 
      studentBehaviors: [], 
      courseId: 'not-found', 
      userIp: '', 
      userId: '', 
      fileLink: '', 
      fileName: '',
      role: 'student'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to remove behaviors grades batch if course does not exist', async () => {
    const result = await sut.execute({ 
      studentBehaviors: [], 
      courseId: 'not-found', 
      userIp: '', 
      userId: '', 
      fileLink: '', 
      fileName: '',
      role: 'manager'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to remove behaviors grade if course has been finished', async () => {
    vi.setSystemTime(new Date('2023-1-5'))

    const endsAtOrError = EndsAt.create(new Date('2023-1-4'))
    if (endsAtOrError.isLeft()) return

    const course = makeCourse({ endsAt: endsAtOrError.value })
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      fileLink: '',
      fileName: '',
      studentBehaviors: [],
      userIp: '',
      userId: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to remove behaviors grades batch if student does not exist.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const student = makeStudent()
    studentsRepository.create(student)

    const studentBehaviors = [
      {
        cpf: student.cpf.value,
        currentYear: 2022,
        module: 1
      },
      {
        cpf: 'not-exist',
        currentYear: 2022,
        module: 1
      },
      {
        cpf: 'not-exist',
        currentYear: 2022,
        module: 1
      },
    ]

    const result = await sut.execute({ 
      studentBehaviors, 
      courseId: course.id.toValue(), 
      userIp: '', 
      userId: '', 
      fileLink: '', 
      fileName: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })  

  it ('should not be able to remove behaviors grades batch if behavior does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const student1 = makeStudent()
    const student2 = makeStudent()
    const student3 = makeStudent()
    studentsRepository.create(student1)
    studentsRepository.create(student2)
    studentsRepository.create(student3)

    const studentBehaviors = [
      {
        cpf: student1.cpf.value,
        january: 7,
        february: 8.2,
        march: 10,
        currentYear: 2022,
        module: 1
      },
      {
        cpf: student2.cpf.value,
        january: 2,
        february: 4,
        march: 5,
        currentYear: 2022,
        module: 1
      },
      {
        cpf: student3.cpf.value,
        january: 7,
        february: 4,
        march: 9,
        currentYear: 2022,
        module: 1
      },
    ]
    const result = await sut.execute({ 
      courseId: course.id.toValue(), 
      studentBehaviors, 
      userIp: '', 
      userId: '', 
      fileLink: '', 
      fileName: '' ,
      role: 'admin'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to remove behaviors grade batch', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const student1 = makeStudent()
    studentsRepository.create(student1)

    const cpfOrError = CPF.create('000.000.000-10')
    if (cpfOrError.isLeft()) return

    const student2 = makeStudent({ cpf: cpfOrError.value })
    studentsRepository.create(student2)

    const cpfOrError2 = CPF.create('000.000.000-01')
    if (cpfOrError2.isLeft()) return
    const student3 = makeStudent({ cpf: cpfOrError2.value })
    studentsRepository.create(student3)

    const behavior1 = makeBehavior({
      studentId: student1.id, 
      courseId: course.id,
      january: 7,
      february: 7.5,
      march: 8.2,
      currentYear: 2022
    })
    const behavior2 = makeBehavior({ 
      studentId: student2.id, 
      courseId: course.id,
      january: 7.2,
      february: 6,
      march: 1,
      currentYear: 2022
    })
    const behavior3 = makeBehavior({ 
      studentId: student3.id, 
      courseId: course.id,
      january: 7,
      february: 7.5,
      march: 5,
      currentYear: 2022
    })
    behaviorsRepository.create(behavior1)
    behaviorsRepository.create(behavior2)
    behaviorsRepository.create(behavior3)

    const studentBehaviors = [
      {
        cpf: student1.cpf.value,
        february: -1,
        march: -1,
        currentYear: 2022,
        module: 1
      },
      {
        cpf: student2.cpf.value,
        february: -1,
        march: -1,
        currentYear: 2022,
        module: 1
      },
      {
        cpf: student3.cpf.value,
        february: -1,
        march: -1,
        currentYear: 2022,
        module: 1
      },
    ]

    const result = await sut.execute({ 
      courseId: course.id.toValue(), 
      studentBehaviors, 
      userIp: '', 
      userId: '', 
      fileLink: '', 
      fileName: '',
      role: 'dev'
    })

    expect(result.isRight()).toBe(true)
    expect(behaviorsBatchRepository.items[0].behaviors).toHaveLength(3)
    expect(behaviorsRepository.items).toMatchObject([
      {
        january: 7,
        february: null,
        march: null,
      },
      {
        january: 7.2,
        february: null,
        march: null,
      },
      {
        january: 7,
        february: null,
        march: null,
      },
    ])
  })
})