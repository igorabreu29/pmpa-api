import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { FakeSheeter } from "test/sheet/fake-sheeter.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import type { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "test/factories/make-get-student-average-in-the-course-use-case.ts";
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { InMemoryCoursesDisciplinesRepository } from "test/repositories/in-memory-courses-disciplines-repository.ts";
import { CreateCourseClassificationByPoleSheetUseCase } from "./create-course-classification-by-pole-sheet.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { makePole } from "test/factories/make-pole.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";
import { makeStudentPole } from "test/factories/make-student-pole.ts";
import type { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import type { GetCourseClassificationByPoleUseCase } from "./get-course-classification-by-pole.ts";
import { makeGetCourseClassificationByPoleUseCase } from "test/factories/make-get-course-classification-by-pole.ts";

let managerCoursesRepository: InMemoryManagersCoursesRepository

let assessmentsRepository: InMemoryAssessmentsRepository
let behaviorsRepository: InMemoryBehaviorsRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository

let studentsRepository: InMemoryStudentsRepository
let studentPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase

let coursesRepository: InMemoryCoursesRepository
let studentCoursesRepository: InMemoryStudentsCoursesRepository
let getCourseClassificationByPole: GetCourseClassificationByPoleUseCase
let sheeter: FakeSheeter
let sut: CreateCourseClassificationByPoleSheetUseCase

describe('Create Course Classification By Pole Sheet', () => {
  beforeEach(() => {
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
    polesRepository = new InMemoryPolesRepository()
    
    coursesRepository = new InMemoryCoursesRepository ()
    studentPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentCoursesRepository,
      coursesRepository,
      polesRepository
    )

    assessmentsRepository = new InMemoryAssessmentsRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()
    courseDisciplinesRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository
    )

    getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase({
      assessmentsRepository,
      behaviorsRepository,
      disciplinesRepository,
      courseDisciplinesRepository
    })

    getCourseClassificationByPole = makeGetCourseClassificationByPoleUseCase({
      coursesRepository,
      polesRepository,
      managerCoursesRepository,
      studentPolesRepository,
      getStudentAverageInTheCourseUseCase
    })
    sheeter = new FakeSheeter() 

    sut = new CreateCourseClassificationByPoleSheetUseCase(
      coursesRepository,
      polesRepository,
      studentPolesRepository,
      getCourseClassificationByPole,
      sheeter
    )
  })

  it ('should not be able to create course classification by pole sheet if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found',
      poleId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to create course classification by pole sheet if pole does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to create course classification by pole sheet', async () => {
    const course = makeCourse({}, new UniqueEntityId('course-1'))
    coursesRepository.create(course)

    const pole = makePole({}, new UniqueEntityId('pole-1'))
    const pole2 = makePole({}, new UniqueEntityId('pole-2'))
    polesRepository.createMany([pole, pole2])

    const student = makeStudent({}, new UniqueEntityId('student-1'))
    const student2 = makeStudent({}, new UniqueEntityId('student-2'))
    studentsRepository.create(student)
    studentsRepository.create(student2)

    const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
    const studentCourse2 = makeStudentCourse({ courseId: course.id, studentId: student2.id })
    studentCoursesRepository.createMany([studentCourse, studentCourse2])

    const studentPole = makeStudentPole({ poleId: pole.id, studentId: studentCourse.id })
    const studentPole2 = makeStudentPole({ poleId: pole2.id, studentId: studentCourse2.id })
    studentPolesRepository.createMany([studentPole, studentPole2])

    const result = await sut.execute({
      courseId: course.id.toValue(),
      poleId: pole.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      filename: `${course.name.value} - Classificação Por Polo.xlsx`
    })
  })
})