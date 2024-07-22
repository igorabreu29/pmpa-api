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
import { GetCourseClassificationByPoleUseCase } from './get-course-classification-by-pole.ts'
import { GetStudentAverageInTheCourseUseCase } from './get-student-average-in-the-course.ts'

let studentsRepository: InMemoryStudentsRepository
let coursesRepository: InMemoryCoursesRepository
let studentsPolesRepository: InMemoryStudentsPolesRepository
let polesRepository: InMemoryPolesRepository
let studentsCoursesRepository: InMemoryStudentsCoursesRepository

let assessmentsRepository: InMemoryAssessmentsRepository
let behaviorsRepository: InMemoryBehaviorsRepository
let courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository
let getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
let sut: GetCourseClassificationByPoleUseCase

describe('Get Classfication Course By Pole Use Case', () => {
  beforeEach(() => {
    studentsRepository = new InMemoryStudentsRepository(
      studentsCoursesRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )

    studentsCoursesRepository = new InMemoryStudentsCoursesRepository(
      studentsRepository,
      coursesRepository,
      studentsPolesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository ()
    polesRepository = new InMemoryPolesRepository()
    studentsPolesRepository = new InMemoryStudentsPolesRepository(
      studentsRepository,
      studentsCoursesRepository,
      polesRepository
    )

    assessmentsRepository = new InMemoryAssessmentsRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()
    courseDisciplinesRepository = new InMemoryCoursesDisciplinesRepository()
    getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase({
      assessmentsRepository,
      behaviorsRepository,
      courseDisciplinesRepository
    })

    sut = new GetCourseClassificationByPoleUseCase (
      coursesRepository,
      polesRepository,
      studentsPolesRepository,
      getStudentAverageInTheCourseUseCase
    )
  })

  it ('should not be able to get classification if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-exist',
      poleId: '',
      page: 1,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should not be able to get classification if pole does not exist', async () => {
    const result = await sut.execute({
      courseId: '',
      poleId: 'not-exist',
      page: 1,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get course classification by pole', async () => {
    const course = makeCourse({ isPeriod: true, formula: 'CFO' }, new UniqueEntityId('course-1'))
    coursesRepository.create(course)

    const pole1 = makePole({}, new UniqueEntityId('pole-1'))
    polesRepository.createMany([pole1])

    const student1 = makeStudent({}, new UniqueEntityId('student-1'))
    const student2 = makeStudent({}, new UniqueEntityId('student-2'))
    studentsRepository.create(student1)
    studentsRepository.create(student2)

    const studentCourse1 = makeStudentCourse({ studentId: student1.id, courseId: course.id })
    const studentCourse2 = makeStudentCourse({ studentId: student2.id, courseId: course.id })
    studentsCoursesRepository.create(studentCourse1)
    studentsCoursesRepository.create(studentCourse2)

    const studentPole1 = makeStudentPole({ studentId: studentCourse1.id, poleId: pole1.id })
    const studentPole2 = makeStudentPole({ studentId: studentCourse2.id, poleId: pole1.id })
    studentsPolesRepository.create(studentPole1)
    studentsPolesRepository.create(studentPole2)

    const result = await sut.execute({
      courseId: 'course-1',
      poleId: 'pole-1',
      page: 1
    })

    const expected = {
      studentsWithAverage: [
        {
          studentAverage: {
            averageInform: {
              geralAverage: 6.771,
              behaviorAverageStatus: [
                { behaviorAverage: 6.542, status: 'approved' }
              ],
              status: { concept: 'regular', status: 'approved' }
            },

            assessments: {
              module1: [
                {
                  module: 1,
                  average: 7,
                }
              ],
              module2: [
                {
                  module: 2,
                  average: 9,
                }
              ],
              module3: [
                {
                  module: 3,
                  average: 8.5,
                }
              ],
            },
            assessmentsCount: 3
          },
          studentBirthday: expect.any(Date)
        },
        
        {
          studentAverage: {
            averageInform: {
              geralAverage: 6.454,
              behaviorAverageStatus: [
                { behaviorAverage: 5.708, status: 'disapproved' }
              ],
              status: { concept: 'regular', status: 'approved' }
            },

            assessments: {
              module1: [
                {
                  module: 1,
                  average: 7.2
                }
              ],
              module2: [
                {
                  module: 2,
                  average: 6.6
                }
              ],
              module3: [
                {
                  module: 3,
                  average: 10
                }
              ],
            },
            assessmentsCount: 3
          },
          studentBirthday: expect.any(Date)
        },
      ]
    }

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject(expected)
  })
})