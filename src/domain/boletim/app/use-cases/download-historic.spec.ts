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
import type { GetCourseClassificationUseCase } from "./get-course-classification.ts";
import { makeGetCourseClassificationUseCase } from "test/factories/make-get-course-classification-use-case.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { makeCourseDiscipline } from "test/factories/make-course-discipline.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";
import { makeStudentPole } from "test/factories/make-student-pole.ts";
import { makePole } from "test/factories/make-pole.ts";
import { InMemoryClassificationsRepository } from "test/repositories/in-memory-classifications-repository.ts";
import { makeClassification } from "test/factories/make-classification.ts";

let assessmentsRepository: InMemoryAssessmentsRepository
let behaviorsRepository: InMemoryBehaviorsRepository
let getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
let studentCoursesRepository: InMemoryStudentsCoursesRepository
let studentPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let classificationsRepository: InMemoryClassificationsRepository

let coursesRepository: InMemoryCoursesRepository
let courseHistoricRepository: InMemoryCourseHistoricRepository
let studentsRepository: InMemoryStudentsRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository
let getCourseClassification: GetCourseClassificationUseCase
let fakePDF: FakePDF

let sut: DownloadHistoricUseCase

describe('Download Historic Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    polesRepository = new InMemoryPolesRepository()
    studentPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentCoursesRepository,
      coursesRepository,
      polesRepository
    )
    studentsRepository = new InMemoryStudentsRepository(
      studentCoursesRepository,
      coursesRepository,
      studentPolesRepository,
      polesRepository
    )
    studentCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentPolesRepository,
      polesRepository
    )
    disciplinesRepository = new InMemoryDisciplinesRepository()
    assessmentsRepository = new InMemoryAssessmentsRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()

    courseHistoricRepository = new InMemoryCourseHistoricRepository()

    courseDisciplinesRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository,
      assessmentsRepository
    )
    classificationsRepository = new InMemoryClassificationsRepository()

    getCourseClassification = makeGetCourseClassificationUseCase({
      coursesRepository,
      classificationsRepository,
      studentCoursesRepository,
    })
    fakePDF = new FakePDF()

    sut = new DownloadHistoricUseCase(
      coursesRepository,
      courseHistoricRepository,
      studentsRepository,
      courseDisciplinesRepository,
      getCourseClassification,
      behaviorsRepository,
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

    const pole = makePole()
    polesRepository.create(pole)

    const student = makeStudent({}, new UniqueEntityId('student-1'))
    studentsRepository.create(student)

    const studentCourse = makeStudentCourse({ studentId: student.id, courseId: course.id })
    const studentPole = makeStudentPole({ studentId: studentCourse.id, poleId: pole.id })

    studentCoursesRepository.create(studentCourse)
    studentPolesRepository.create(studentPole)

    const classification = makeClassification({
      courseId: course.id,
      studentId: student.id,
      studentBirthday: student.birthday.value
    })
    classificationsRepository.createMany([classification])

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