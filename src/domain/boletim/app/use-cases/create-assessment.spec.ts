import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateAssessmentUseCase } from "./create-assessment.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { EndsAt } from "../../enterprise/entities/value-objects/ends-at.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { FakeGenerateClassification } from "test/classification/fake-generate-classification.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let assessmentsRepository: InMemoryAssessmentsRepository
let coursesRepository: InMemoryCoursesRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let studentsRepository: InMemoryStudentsRepository
let generateClassification: FakeGenerateClassification

let sut: CreateAssessmentUseCase

describe(('Create Assessment Use Case'), () => {
  beforeEach(() => {
    vi.useFakeTimers(),
    assessmentsRepository = new InMemoryAssessmentsRepository()
    coursesRepository = new InMemoryCoursesRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    generateClassification = new FakeGenerateClassification()

    sut = new CreateAssessmentUseCase(
      assessmentsRepository,
      coursesRepository,
      disciplinesRepository,
      studentsRepository,
      generateClassification
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it ('should not be able to create assessment if user access is student', async () => {
    const result = await sut.execute({
      studentId: '',
      courseId: '',
      disciplineId: '',
      vf: 2,
      userIp: '',
      userId: '',
      role: 'student'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to create assessment if course does not exist', async () => {
    const assessment = makeAssessment()
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      studentId: assessment.studentId.toValue(),
      courseId: assessment.courseId.toValue(),
      disciplineId: assessment.disciplineId.toValue(),
      vf: 2,
      userIp: '',
      userId: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create assessment if discipline does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const assessment = makeAssessment({ courseId: course.id })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      studentId: assessment.studentId.toValue(),
      courseId: assessment.courseId.toValue(),
      disciplineId: assessment.disciplineId.toValue(),
      vf: 2,
      userIp: '',
      userId: '',
      role: 'manager'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create assessment if student does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const assessment = makeAssessment({ courseId: course.id, disciplineId: discipline.id })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      studentId: assessment.studentId.toValue(),
      courseId: assessment.courseId.toValue(),
      disciplineId: assessment.disciplineId.toValue(),
      vf: 2,
      userIp: '',
      userId: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create assessment if course has been finished', async () => {
    vi.setSystemTime(new Date('2022-1-5'))

    const endsAt = EndsAt.create(new Date('2022-1-4'))
    if (endsAt.isLeft()) return 

    const course = makeCourse({ endsAt: endsAt.value })
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const student = makeStudent()
    studentsRepository.create(student)

    const assessment = makeAssessment({ courseId: course.id, disciplineId: discipline.id, studentId: student.id })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      studentId: assessment.studentId.toValue(),
      courseId: assessment.courseId.toValue(),
      disciplineId: assessment.disciplineId.toValue(),
      vf: 2,
      userIp: '',
      userId: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to create assessment if already be added', async () => {
    vi.setSystemTime(new Date('2022-1-5'))

    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const student = makeStudent()
    studentsRepository.create(student)

    const assessment = makeAssessment({ courseId: course.id, disciplineId: discipline.id, studentId: student.id })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      studentId: assessment.studentId.toValue(),
      courseId: assessment.courseId.toValue(),
      disciplineId: assessment.disciplineId.toValue(),
      vf: 2,
      userIp: '',
      userId: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should not be able to create asssessment if avi is less than 0', async () => {
    vi.setSystemTime(new Date('2022-1-5'))

    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({
      studentId: student.id.toValue(),
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue(),
      vf: 5,
      avi: -1,
      userIp: '',
      userId: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to create asssessment if avii is less than 0', async () => {
    vi.setSystemTime(new Date('2022-1-5'))

    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({
      studentId: student.id.toValue(),
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue(),
      vf: 5,
      avi: 5,
      avii: -1,
      userIp: '',
      userId: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to create asssessment if vfe is less than 0', async () => {
    vi.setSystemTime(new Date('2022-1-5'))

    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({
      studentId: student.id.toValue(),
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue(),
      vf: 5,
      vfe: -1,
      userIp: '',
      userId: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to create asssessment if avii has been passed and avi has not passed', async () => {
    vi.setSystemTime(new Date('2022-1-5'))

    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({
      studentId: student.id.toValue(),
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue(),
      vf: 5,
      avii: 10,
      userIp: '',
      userId: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should be able to create assessment', async () => {
    vi.setSystemTime(new Date('2022-1-5'))

    const course = makeCourse()
    coursesRepository.create(course)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const student = makeStudent()
    studentsRepository.create(student)


    const result = await sut.execute({
      studentId: student.id.toValue(),
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue(),
      vf: 5,
      userIp: '',
      userId: '',
      role: 'manager'
    })

    expect(result.isRight()).toBe(true)
    expect(assessmentsRepository.items).toHaveLength(1)
  })
})