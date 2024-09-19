import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts";
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { makeStudent } from "test/factories/make-student.ts";
import { makePole } from "test/factories/make-pole.ts";
import { makeStudentCourse } from "test/factories/make-student-course.ts";
import { makeStudentPole } from "test/factories/make-student-pole.ts";
import { CreateCourseAssessmentClassificationSheetUseCase } from "./create-course-assessment-classification-sheet.ts";
import type { GetCourseAssessmentClassificationUseCase } from "./get-course-assessment-classification.ts";
import { makeGetCourseAssessmentClassification } from "test/factories/make-get-course-assessment-classification.ts";
import { InMemoryCoursesPolesRepository } from "test/repositories/in-memory-courses-poles-repository.ts";
import { makeCoursePole } from "test/factories/make-course-pole.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { FakeSheeter } from "test/files/fake-sheeter.ts";


let disciplinesRepository: InMemoryDisciplinesRepository
let studentsRepository: InMemoryStudentsRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let assessmentsRepository: InMemoryAssessmentsRepository
let coursePolesRepository: InMemoryCoursesPolesRepository
let studentCoursesRepository: InMemoryStudentsCoursesRepository

let coursesRepository: InMemoryCoursesRepository
let getCourseAssessmentClassification: GetCourseAssessmentClassificationUseCase
let sheeter: FakeSheeter
let sut: CreateCourseAssessmentClassificationSheetUseCase

describe('Create Course Assessment Classification Sheet', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository(
      studentCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentCoursesRepository,
      coursesRepository,
      polesRepository
    )
    polesRepository = new InMemoryPolesRepository()

    coursesRepository = new InMemoryCoursesRepository ()
    studentCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    assessmentsRepository = new InMemoryAssessmentsRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()
    coursePolesRepository = new InMemoryCoursesPolesRepository(
      polesRepository
    )

    getCourseAssessmentClassification = makeGetCourseAssessmentClassification({
      coursesRepository,
      studentCoursesRepository,
      assessmentsRepository,
      coursesPolesRepository: coursePolesRepository
    })
    sheeter = new FakeSheeter() 

    sut = new CreateCourseAssessmentClassificationSheetUseCase(
      coursesRepository,
      getCourseAssessmentClassification,
      sheeter
    )
  })

  it ('should not be able to create course assessment classification sheet if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-found'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to create course assessment classification sheet', async () => {
    const course = makeCourse({}, new UniqueEntityId('course-1'))
    coursesRepository.create(course)

    const pole = makePole({}, new UniqueEntityId('pole-1'))
    const pole2 = makePole({}, new UniqueEntityId('pole-2'))
    polesRepository.createMany([pole, pole2])

    const coursePole = makeCoursePole({ courseId: course.id, poleId: pole.id })
    const coursePole2 = makeCoursePole({ courseId: course.id, poleId: pole2.id })
    coursePolesRepository.createMany([coursePole, coursePole2])

    const discipline = makeDiscipline()
    disciplinesRepository.create(discipline)

    const student = makeStudent({}, new UniqueEntityId('student-1'))
    const student2 = makeStudent({}, new UniqueEntityId('student-2'))
    studentsRepository.create(student)
    studentsRepository.create(student2)

    const studentCourse = makeStudentCourse({ courseId: course.id, studentId: student.id })
    const studentCourse2 = makeStudentCourse({ courseId: course.id, studentId: student2.id })
    studentCoursesRepository.createMany([studentCourse, studentCourse2])

    const studentPole = makeStudentPole({ poleId: pole.id, studentId: studentCourse.id })
    const studentPole2 = makeStudentPole({ poleId: pole2.id, studentId: studentCourse2.id })
    studentsPolesRepository.createMany([studentPole, studentPole2])

    const assessment = makeAssessment({ courseId: course.id, studentId: student.id, disciplineId: discipline.id, vf: 9.25 })
    const assessment2 = makeAssessment({ courseId: course.id, studentId: student2.id, disciplineId: discipline.id, vf: 9.2 })
    assessmentsRepository.createMany([assessment, assessment2])

    const result = await sut.execute({
      courseId: course.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      filename: `${course.name.value} - Classificação de Avaliações.xlsx`
    })
  })
})