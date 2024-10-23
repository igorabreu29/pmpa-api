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
import { UpdateStudentClassificationUseCase } from './update-student-classification.ts'
import { ConflictError } from './errors/conflict-error.ts'

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

let sut: UpdateStudentClassificationUseCase

describe('Update Student Classfication Use Case', () => {
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

    sut = new UpdateStudentClassificationUseCase(
      coursesRepository,
      getStudentAverageInTheCourseUseCase,
      classificationsRepository,
    )
  })

  it ('should not be able to update student classification if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-exist',
      studentId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to update student classification if student classification does not exist', async () => {
    const course = makeCourse()
    coursesRepository.create(course)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      studentId: ''
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ConflictError)
  })

  it ('should be able to update student classification', async () => {
    const course = makeCourse({ formula: 'CAS' }, new UniqueEntityId('course-1'))
    coursesRepository.create(course)

    const pole1 = makePole()
    const pole2 = makePole()
    polesRepository.createMany([pole1, pole2])

    const student = makeStudent({}, new UniqueEntityId('student-1'))
    studentsRepository.create(student)

    const studentCourse = makeStudentCourse({ studentId: student.id, courseId: course.id })
    studentsCoursesRepository.create(studentCourse)

    const studentPole1 = makeStudentPole({ studentId: studentCourse.id, poleId: pole1.id })
    studentsPolesRepository.create(studentPole1)

    const classification = makeClassification({ courseId: course.id, studentId: student.id })
    classificationsRepository.createMany([classification])

    assessmentsRepository.items[0].vf = 10
    assessmentsRepository.items[1].vf = 8
    assessmentsRepository.items[2].vf = 9.25

    const result = await sut.execute({
      courseId: course.id.toValue(),
      studentId: student.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(classificationsRepository.items[0]).toMatchObject({
      assessments: expect.arrayContaining([
        expect.objectContaining({
          vf: 10
        }),
        expect.objectContaining({
          vf: 8
        }),
        expect.objectContaining({
          vf: 9.25
        }),
      ])
    })
  })
})