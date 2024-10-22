import { InMemoryAssessmentsRepository } from 'test/repositories/in-memory-assessments-repository.ts'
import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { InMemoryCoursesPolesRepository } from 'test/repositories/in-memory-courses-poles-repository.ts'
import { makeCoursePole } from 'test/factories/make-course-pole.ts'
import type { GetStudentAverageInTheCourseUseCase } from './get-student-average-in-the-course.ts'
import { makeGetStudentAverageInTheCourseUseCase } from 'test/factories/make-get-student-average-in-the-course-use-case.ts'
import { InMemoryBehaviorsRepository } from 'test/repositories/in-memory-behaviors-repository.ts'
import { InMemoryDisciplinesRepository } from 'test/repositories/in-memory-disciplines-repository.ts'
import { InMemoryCoursesDisciplinesRepository } from 'test/repositories/in-memory-courses-disciplines-repository.ts'
import { GetAverageClassificationCoursePolesUseCase } from './get-average-classification-course-poles.ts'
import { InMemoryClassificationsRepository } from 'test/repositories/in-memory-classifications-repository.ts'
import { makeClassification } from 'test/factories/make-classification.ts'

let studentsRepository: InMemoryStudentsRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository

let coursesPolesRepository: InMemoryCoursesPolesRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository

let assessmentsRepository: InMemoryAssessmentsRepository
let behaviorsRepository: InMemoryBehaviorsRepository
let disciplinesRepository: InMemoryDisciplinesRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository
let classificationsRepository: InMemoryClassificationsRepository

let sut: GetAverageClassificationCoursePolesUseCase

describe('Get Course Assessment Classification', () => {
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

    coursesPolesRepository = new InMemoryCoursesPolesRepository(
      polesRepository
    )
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

    sut = new GetAverageClassificationCoursePolesUseCase(
      coursesRepository,
      coursesPolesRepository,
      classificationsRepository,
    )
  })

  it ('should not be able to get assessment classification if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-exist',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get assessment classification', async () => {
    const course = makeCourse({ formula: 'CAS' }, new UniqueEntityId('course-1'))
    coursesRepository.create(course)

    const pole1 = makePole()
    const pole2 = makePole()
    polesRepository.createMany([pole1, pole2])

    const coursePole = makeCoursePole({
      courseId: course.id,
      poleId: pole1.id
    })
    const coursePole2 = makeCoursePole({
      courseId: course.id,
      poleId: pole2.id
    })
    coursesPolesRepository.createMany([coursePole, coursePole2])

    const student = makeStudent({}, new UniqueEntityId('student-1'))
    const student2 = makeStudent({}, new UniqueEntityId('student-2'))
    studentsRepository.create(student)
    studentsRepository.create(student2)

    const studentCourse = makeStudentCourse({ studentId: student.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    studentsCoursesRepository.create(studentCourse)
    studentsCoursesRepository.create(studentCourse2)

    const studentPole1 = makeStudentPole({ studentId: studentCourse.id, poleId: pole1.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole2.id })
    studentsPolesRepository.create(studentPole1)
    studentsPolesRepository.create(studentPole2)

    const classification = makeClassification({
      courseId: course.id,
      studentId: student.id,
      poleId: pole1.id,
      assessments: [
        {
          vf: 10,
          average: 10,
          avi: null,
          avii: null,
          courseId: course.id.toValue(),
          disciplineId: '',
          id: '',
          isRecovering: false,
          module: 1,
          status: 'approved'
        },
        {
          vf: 10,
          average: 9,
          avi: 8,
          avii: null,
          courseId: course.id.toValue(),
          disciplineId: '',
          id: '',
          isRecovering: false,
          module: 1,
          status: 'approved'
        }
      ],
      assessmentsCount: 3,
      average: 9.5,
      concept: 'very good',
      isPeriod: false,
      status: 'approved'
    })

    const classification2 = makeClassification({
      courseId: course.id,
      studentId: student.id,
      poleId: pole2.id,
      assessments: [
        {
          vf: 8,
          average: 8,
          avi: null,
          avii: null,
          courseId: course.id.toValue(),
          disciplineId: '',
          id: '',
          isRecovering: false,
          module: 1,
          status: 'approved'
        },
        {
          vf: 10,
          average: 9,
          avi: 8,
          avii: null,
          courseId: course.id.toValue(),
          disciplineId: '',
          id: '',
          isRecovering: false,
          module: 1,
          status: 'approved'
        }
      ],
      assessmentsCount: 3,
      average: 8.5,
      concept: 'good',
      isPeriod: false,
      status: 'approved'
    })
    classificationsRepository.createMany([classification, classification2])

    const result = await sut.execute({
      courseId: course.id.toValue(),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      studentsAverageGroupedByPole: [
        {
          poleAverage: {
            average: 9.5,
            name: pole1.name.value
          }
        },
        {
          poleAverage: {
            average: 8.5,
            name: pole2.name.value
          }
        },
      ]
    })
  })
})