import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeGetStudentAverageInTheCourseUseCase } from 'test/factories/make-get-student-average-in-the-course-use-case.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts"
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts"
import { InMemoryCoursesDisciplinesRepository } from 'test/repositories/in-memory-courses-disciplines-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { beforeEach, describe, expect, it } from 'vitest'
import { GetCourseClassificationUseCase } from './get-course-classification.ts'
import { GetStudentAverageInTheCourseUseCase } from './get-student-average-in-the-course.ts'
import { InMemoryDisciplinesRepository } from 'test/repositories/in-memory-disciplines-repository.ts'
import { InMemoryClassificationsRepository } from 'test/repositories/in-memory-classifications-repository.ts'
import { GenerateCourseClassificationUseCase } from './generate-course-classification.ts'
import { makeClassification } from 'test/factories/make-classification.ts'
import { UpdateCourseClassificationUseCase } from './update-course-classification.ts'

let studentsRepository: InMemoryStudentsRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository

let assessmentsRepository: InMemoryAssessmentsRepository
let behaviorsRepository: InMemoryBehaviorsRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository
let classificationsRepository: InMemoryClassificationsRepository
let getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase

let sut: UpdateCourseClassificationUseCase

describe('Update Course Classfication Use Case', () => {
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

    assessmentsRepository = new InMemoryAssessmentsRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()
    disciplinesRepository = new InMemoryDisciplinesRepository()
    courseDisciplinesRepository = new InMemoryCoursesDisciplinesRepository(
      disciplinesRepository,
      assessmentsRepository
    )
    classificationsRepository = new InMemoryClassificationsRepository()
    getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase({
      assessmentsRepository,
      behaviorsRepository,
      disciplinesRepository,
      courseDisciplinesRepository
    })

    sut = new UpdateCourseClassificationUseCase(
      coursesRepository,
      getStudentAverageInTheCourseUseCase,
      classificationsRepository,
    )
  })

  it ('should not be able to generate classification if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-exist',
      page: 1
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get geral course classification', async () => {
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

    const classification = makeClassification({ courseId: course.id, studentId: student1.id })
    const classification2 = makeClassification({ courseId: course.id, studentId: student2.id })
    classificationsRepository.createMany([classification, classification2])

    assessmentsRepository.items[0].vf = 10

    const result = await sut.execute({
      courseId: 'course-1',
      page: 1
    })

    expect(result.isRight()).toBe(true)
    expect(classificationsRepository.items).toMatchObject([
      {
        id: classification.id,
        assessments: expect.arrayContaining([
          expect.objectContaining({
            vf: 10
          }),
          expect.objectContaining({
            vf: 9
          }),
          expect.objectContaining({
            vf: 8.5
          })
        ])
      },
      {
        id: classification2.id,
        assessments: expect.arrayContaining([
          expect.objectContaining({
            vf: 7.2
          }),
          expect.objectContaining({
            vf: 6.6
          }),
          expect.objectContaining({
            vf: 10
          })
        ])
      }
    ])
  })
})