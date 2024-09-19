import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { InMemoryCoursesDisciplinesRepository } from "test/repositories/in-memory-courses-disciplines-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { FakePDF } from "test/files/fake-pdf.ts";
import { DownloadHistoricUseCase } from "./download-historic.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "test/factories/make-get-student-average-in-the-course-use-case.ts";
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { InMemoryCourseHistoricRepository } from "test/repositories/in-memory-course-historic-repository.ts";
import { makeCourseHistoric } from "test/factories/make-course-historic.ts";

let studentCoursesResitory: InMemoryStudentsCoursesRepository
let studentPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let assessmentsRepository: InMemoryAssessmentsRepository
let behaviorsRepository: InMemoryBehaviorsRepository
let disciplinesRepository: InMemoryDisciplinesRepository

let coursesRepository: InMemoryCoursesRepository
let courseHistoricRepository: InMemoryCourseHistoricRepository
let studentsRepository: InMemoryStudentsRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository
let getStudentAverage: GetStudentAverageInTheCourseUseCase
let fakePDF: FakePDF

let sut: DownloadHistoricUseCase

describe('Download Historic Use Case', () => {
  beforeEach(() => {
    polesRepository = new InMemoryPolesRepository()
    studentPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentCoursesResitory,
      coursesRepository,
      polesRepository
    )
    studentCoursesResitory = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentPolesRepository,
      polesRepository
    )
    assessmentsRepository = new InMemoryAssessmentsRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()

    coursesRepository = new InMemoryCoursesRepository()
    courseHistoricRepository = new InMemoryCourseHistoricRepository()
    studentsRepository = new InMemoryStudentsRepository(
      studentCoursesResitory,
      coursesRepository,
      studentPolesRepository,
      polesRepository
    )
    courseDisciplinesRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository
    )
    getStudentAverage = makeGetStudentAverageInTheCourseUseCase({
      disciplinesRepository,
      courseDisciplinesRepository,
      assessmentsRepository,
      behaviorsRepository
    })
    fakePDF = new FakePDF()

    sut = new DownloadHistoricUseCase(
      coursesRepository,
      courseHistoricRepository,
      studentsRepository,
      courseDisciplinesRepository,
      getStudentAverage,
      fakePDF
    )
  })

  it ('should not be able to download historic if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found',
      studentId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to download historic if student does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      studentId: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to download historic if course historic does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const student = makeStudent()
    studentsRepository.create(student)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      studentId: student.id.toValue()
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to download historic', async () => {
    const course = makeCourse({}, new UniqueEntityId('course-1'))
    coursesRepository.create(course)

    const student = makeStudent({}, new UniqueEntityId('student-1'))
    studentsRepository.create(student)

    const courseHistoric = makeCourseHistoric({ courseId: course.id })
    courseHistoricRepository.create(courseHistoric)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      studentId: student.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      filename: `${course.name.value} - Academic Record.pdf`
    })
  })
})