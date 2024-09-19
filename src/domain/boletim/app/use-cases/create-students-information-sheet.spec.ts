import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts"
import { InMemoryCoursesDisciplinesRepository } from "test/repositories/in-memory-courses-disciplines-repository.ts"
import { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts"
import { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts"
import { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts"
import { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts"
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository.ts"
import { beforeEach, describe, expect, it } from "vitest"
import { InMemoryDisciplinesRepository } from "test/repositories/in-memory-disciplines-repository.ts"
import { makeCourse } from "test/factories/make-course.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { makePole } from "test/factories/make-pole.ts"
import { makeStudent } from "test/factories/make-student.ts"
import { makeStudentCourse } from "test/factories/make-student-course.ts"
import { makeStudentPole } from "test/factories/make-student-pole.ts"
import { makeDiscipline } from "test/factories/make-discipline.ts"
import { makeAssessment } from "test/factories/make-assessment.ts"
import { makeCourseDiscipline } from "test/factories/make-course-discipline.ts"
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts"
import { CreateStudentsInformationSheetUseCase } from "./create-students-information-sheet.ts"
import { FakeSheeter } from "test/files/fake-sheeter.ts"

let studentsRepository: InMemoryStudentsRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository
let assessmentsRepository: InMemoryAssessmentsRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository
let sheeter: FakeSheeter

let sut: CreateStudentsInformationSheetUseCase

describe('Create Students Information Sheet Use Case', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository ()
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      coursesRepository,
      polesRepository
    )
    polesRepository = new InMemoryPolesRepository()
    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    disciplinesRepository = new InMemoryDisciplinesRepository()
    assessmentsRepository = new InMemoryAssessmentsRepository()
    courseDisciplinesRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository
    )
    sheeter = new FakeSheeter()

    sut = new CreateStudentsInformationSheetUseCase(
      coursesRepository,
      studentsCoursesRepository,
      courseDisciplinesRepository,
      assessmentsRepository,
      sheeter
    )
  })

  it ('should not be able to create students information sheet if course does not exist', async () => {
    const result = await sut.execute({ courseId: '' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to create students information sheet', async () => {
    const course = makeCourse({ formula: 'CAS' }, new UniqueEntityId('course-1'))
    coursesRepository.create(course)

    const pole1 = makePole()
    const pole2 = makePole()
    polesRepository.createMany([pole1, pole2])

    const student1 = makeStudent({}, new UniqueEntityId('student-1'))
    const student2 = makeStudent({}, new UniqueEntityId('student-2'))
    studentsRepository.create(student1)
    studentsRepository.create(student2)

    const studentCourse1 = makeStudentCourse({ studentId: student1.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    studentsCoursesRepository.create(studentCourse1)
    studentsCoursesRepository.create(studentCourse2)

    const studentPole1 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole1.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole2.id })
    studentsPolesRepository.create(studentPole1)
    studentsPolesRepository.create(studentPole2)

    const discipline1 = makeDiscipline()
    const discipline2 = makeDiscipline()
    const discipline3 = makeDiscipline()
    disciplinesRepository.createMany([discipline1, discipline2, discipline3])
  
    const assessment1 = makeAssessment({ courseId: course.id, studentId: new UniqueEntityId('student-1'), vf: 7, disciplineId: discipline1.id })
    const assessment2 = makeAssessment({ courseId: course.id, studentId: new UniqueEntityId('student-1'), vf: 9, disciplineId: discipline2.id })
    const assessment3 = makeAssessment({ courseId: course.id, studentId: new UniqueEntityId('student-1'), vf: 8.5, disciplineId: discipline3.id })
    const assessment4 = makeAssessment({ courseId: course.id, studentId: new UniqueEntityId('student-2'), vf: 7.2, disciplineId: discipline1.id })
    const assessment5 = makeAssessment({ courseId: course.id, studentId: new UniqueEntityId('student-2'), vf: 6.6, disciplineId: discipline2.id })
    const assessment6 = makeAssessment({ courseId: course.id, studentId: new UniqueEntityId('student-2'), vf: 10, disciplineId: discipline3.id })
    assessmentsRepository.createMany([assessment1, assessment2, assessment3, assessment4, assessment5, assessment6])
  
    const courseDiscipline1 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline1.id, module: 1 })
    const courseDiscipline2 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline2.id, module: 2 })
    const courseDiscipline3 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline3.id, module: 3 })
    courseDisciplinesRepository.create(courseDiscipline1)
    courseDisciplinesRepository.create(courseDiscipline2)
    courseDisciplinesRepository.create(courseDiscipline3)

    const result = await sut.execute({
      courseId: course.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      filename: `${course.name.value} - Informações dos estudantes.xlsx`
    })
  })
})