import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { NotAllowedError } from "@/core/errors/use-case/not-allowed-error.ts";
import { RemoveAssessmentGradeUseCase } from "./remove-assessment-grade.ts";
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

let assessmentsRepository: InMemoryAssessmentsRepository
let coursesRepository: InMemoryCoursesRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let studentsRepository: InMemoryStudentsRepository
let sut: RemoveAssessmentGradeUseCase

describe(('Remove Assessment Grade Use Case'), () => {
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
    assessmentsRepository = new InMemoryAssessmentsRepository()
    sut = new RemoveAssessmentGradeUseCase(assessmentsRepository)
  })

  it ('should not be able to update assessment if access level is student', async () => {
    const result = await sut.execute({
      studentId: '',
      disciplineId: '',
      courseId: '',
      userId: '',
      userIp: '',
      role: 'student'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
  
  it ('should not be able to remove grade if assessment does not exist', async () => {
    const result = await sut.execute({
      studentId: '',
      disciplineId: '',
      courseId: '',
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

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const student = makeStudent()
    studentsRepository.create(student)

    const assessment = makeAssessment({ vf: 5, avi: 6, avii: 5, courseId: course.id, studentId: student.id, disciplineId: discipline.id })
    assessmentsRepository.create(assessment)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      disciplineId: discipline.id.toValue(),
      studentId: student.id.toValue(),
      avi: -1,
      avii: -1,
      userId: '',
      userIp: '',
      role: 'dev'
    })

    expect(result.isRight()).toBe(true)
    expect(assessmentsRepository.items[0]).toMatchObject({
      vf: assessment.vf,
      avi: null,
      avii: null
    })
  })
})