import { ResourceAlreadyExistError } from "@/core/errors/use-case/resource-already-exist-error.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { makePole } from "test/factories/make-pole.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";
import { makeStudentPole } from "test/factories/make-student-pole.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { InMemoryAssessmentsBatchRepository } from "test/repositories/in-memory-assessments-batch-repository.ts";
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EndsAt } from "../../enterprise/entities/value-objects/ends-at.ts";
import { CreateAssessmentsBatchUseCase } from "./create-assessments-batch.ts";
import { ConflictError } from "./errors/conflict-error.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { FakeGenerateClassification } from "test/classification/fake-generate-classification.ts";

let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let coursesRepository: InMemoryCoursesRepository
let polesRepository: InMemoryPolesRepository

let studentsRepository: InMemoryStudentsRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let assessmentsRepository: InMemoryAssessmentsRepository
let assessmentsBatchRepository: InMemoryAssessmentsBatchRepository
let generateClassification: FakeGenerateClassification
let sut: CreateAssessmentsBatchUseCase

describe('Create Assessments Batch Use Case', () => {
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
    disciplinesRepository = new InMemoryDisciplinesRepository()
    assessmentsRepository = new InMemoryAssessmentsRepository()
    assessmentsBatchRepository = new InMemoryAssessmentsBatchRepository(
      assessmentsRepository
    )

    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    generateClassification = new FakeGenerateClassification()

    sut = new CreateAssessmentsBatchUseCase(
      studentsRepository,
      coursesRepository,
      disciplinesRepository,
      assessmentsRepository,
      assessmentsBatchRepository,
      generateClassification
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it ('should not be able to create assessments batch if user access is student', async () => {
    const result = await sut.execute({
      studentAssessments: [], 
      courseId: 'not-found', 
      userIp: '', 
      userId: '',
      role: 'student', 
      fileLink: '', 
      fileName: '',
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it ('should not be able to create assessments batch if course does not exist', async () => {
    const result = await sut.execute({
      studentAssessments: [], 
      courseId: 'not-found', 
      userIp: '', 
      userId: '',
      role: 'manager', 
      fileLink: '', 
      fileName: '',
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

    const result = await sut.execute({
      courseId: course.id.toValue(),
      fileLink: '',
      fileName: '',
      studentAssessments: [],
      userIp: '',
      userId: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should not be able to create assessments batch if student does not exist.', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const studentAssessments = [
      {
        cpf: 'not-exist',
        disciplineName: 'random',
        poleName: '',
        vf: 0,
      },
      {
        cpf: 'not-exist',
        disciplineName: 'random',
        poleName: '',
        vf: 0,
      },
      {
        cpf: 'not-exist',
        disciplineName: 'random',
        poleName: '',
        vf: 0,
      },
    ]

    const result = await sut.execute({ 
      studentAssessments, 
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

  it ('should not be able to create assessments batch if discipline does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()

    const student1 = makeStudent()
    const student2 = makeStudent()
    studentsRepository.create(student1)
    studentsRepository.create(student2)

    const studentCourse1 = makeStudentCourse({ studentId: student1.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    studentsCoursesRepository.create(studentCourse1)
    studentsCoursesRepository.create(studentCourse2)

    const studentPole1 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole.id })
    studentsPolesRepository.create(studentPole1)
    studentsPolesRepository.create(studentPole2)

    const studentAssessments = [
      {
        cpf: student1.cpf.value,
        disciplineName: 'random',
        poleName: '',
        vf: 0,
      },
      {
        cpf: student2.cpf.value,
        disciplineName: 'random',
        poleName: '',
        vf: 0,
      },
    ]
    const result = await sut.execute({ 
      courseId: course.id.toValue(), 
      studentAssessments, 
      userIp: '', 
      userId: '', 
      fileLink: '', 
      fileName: '',
      role: 'manager'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create assessments batch if the student already has the assessment', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()

    const student1 = makeStudent()
    const student2 = makeStudent()
    studentsRepository.create(student1)
    studentsRepository.create(student2)

    const studentCourse1 = makeStudentCourse({ studentId: student1.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    studentsCoursesRepository.create(studentCourse1)
    studentsCoursesRepository.create(studentCourse2)

    const studentPole1 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole.id })
    studentsPolesRepository.create(studentPole1)
    studentsPolesRepository.create(studentPole2)

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const assessment = makeAssessment({
      courseId: course.id,
      disciplineId: discipline.id,
      studentId: student1.id
    })
    const assessment2 = makeAssessment({
      courseId: course.id,
      disciplineId: discipline.id,
      studentId: student2.id
    })
    assessmentsRepository.createMany([assessment, assessment2])

    const studentAssessments = [
      {
        cpf: student1.cpf.value,
        disciplineName: discipline.name.value,
        poleName: '',
        vf: 0,
      },
      {
        cpf: student2.cpf.value,
        disciplineName: discipline.name.value,
        poleName: '',
        vf: 0,
      },
    ]
    const result = await sut.execute({ 
      courseId: course.id.toValue(), 
      studentAssessments, 
      userIp: '', 
      userId: '', 
      fileLink: '', 
      fileName: '',
      role: 'admin' 
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceAlreadyExistError)
  })

  it ('should be able to create assessments batch', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const pole = makePole()

    const student1 = makeStudent()
    const student2 = makeStudent()
    studentsRepository.create(student1)
    studentsRepository.create(student2)

    const studentCourse1 = makeStudentCourse({ studentId: student1.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    studentsCoursesRepository.create(studentCourse1)
    studentsCoursesRepository.create(studentCourse2)

    const studentPole1 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole.id })
    studentsPolesRepository.create(studentPole1)
    studentsPolesRepository.create(studentPole2)

    const discipline1 = makeDiscipline()
    disciplinesRepository.create(discipline1)

    const discipline2 = makeDiscipline()
    disciplinesRepository.create(discipline2)

    const studentAssessments = [
      {
        cpf: student1.cpf.value,
        disciplineName: discipline1.name.value,
        poleName: pole.name.value,
        vf: 3,
        avi: 7,
      },
      {
        cpf: student2.cpf.value,
        disciplineName: discipline2.name.value,
        poleName: pole.name.value,
        vf: 7,
        avi: 10,
      },
    ]
    const result = await sut.execute({ 
      courseId: course.id.toValue(), 
      studentAssessments, 
      userIp: '', 
      userId: '', 
      fileLink: '', 
      fileName: '',
      role: 'dev' 
    })

    expect(result.isRight()).toBe(true)
    expect(assessmentsBatchRepository.items).toHaveLength(1)
    expect(assessmentsBatchRepository.items[0].assessments).toHaveLength(2)
  })
})