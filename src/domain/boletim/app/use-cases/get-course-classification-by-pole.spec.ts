import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { GetStudentAverageInTheCourseUseCase } from './get-student-average-in-the-course.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts"
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts"
import { makeDiscipline } from 'test/factories/make-discipline.ts'
import { makeAssessment } from 'test/factories/make-assessment.ts'
import { makeBehavior } from 'test/factories/make-behavior.ts'
import { makeCourseDiscipline } from 'test/factories/make-course-discipline.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { InMemoryCoursesDisciplinesRepository } from 'test/repositories/in-memory-courses-disciplines-repository.ts'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository.ts'
import { InMemoryStudentsCoursesRepository } from 'test/repositories/in-memory-students-courses-repository.ts'
import { InMemoryStudentsPolesRepository } from 'test/repositories/in-memory-students-poles-repository.ts'
import { makeStudent } from 'test/factories/make-student.ts'
import { makeStudentCourse } from 'test/factories/make-student-course.ts'
import { makeStudentPole } from 'test/factories/make-student-pole.ts'
import { GetCourseClassificationByPoleUseCase } from './get-course-classification-by-pole.ts'

interface MakeGetStudentAverageInTheCourseUseCase {
  assessmentsRepository: InMemoryAssessmentsRepository
  behaviorsRepository: InMemoryBehaviorsRepository
  courseDisciplinesRepository: InMemoryCoursesDisciplinesRepository
}

export function makeGetStudentAverageInTheCourseUseCase({ assessmentsRepository, behaviorsRepository, courseDisciplinesRepository }: MakeGetStudentAverageInTheCourseUseCase) {
  const discipline1 = makeDiscipline()
  const discipline2 = makeDiscipline()
  const discipline3 = makeDiscipline()

  const assessment1 = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-1'), vf: 7, disciplineId: discipline1.id })
  const assessment2 = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-1'), vf: 9, disciplineId: discipline2.id })
  const assessment3 = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-1'), vf: 8.5, disciplineId: discipline3.id })
  const assessment4 = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-2'), vf: 7.2, disciplineId: discipline1.id })
  const assessment5 = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-2'), vf: 6.6, disciplineId: discipline2.id })
  const assessment6 = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-2'), vf: 10, disciplineId: discipline3.id })
  assessmentsRepository.createMany([assessment1, assessment2, assessment3, assessment4, assessment5, assessment6])

  const behavior1 = makeBehavior({ january: 5, february: 7, march: 10, april: 7, may: 4.5, jun: 5.75, studentId: new UniqueEntityId('student-1'), courseId: new UniqueEntityId('course-1') })
  const behavior2 = makeBehavior({ january: 5, february: 7, march: 3, april: 7, may: 4.5, jun: 7.75, studentId: new UniqueEntityId('student-2'), courseId: new UniqueEntityId('course-1') })
  behaviorsRepository.items.push(behavior1)
  behaviorsRepository.items.push(behavior2)

  const courseDiscipline1 = makeCourseDiscipline({ courseId: new UniqueEntityId('course-1'), disciplineId: discipline1.id, module: 1 })
  const courseDiscipline2 = makeCourseDiscipline({ courseId: new UniqueEntityId('course-1'), disciplineId: discipline2.id, module: 2 })
  const courseDiscipline3 = makeCourseDiscipline({ courseId: new UniqueEntityId('course-1'), disciplineId: discipline3.id, module: 3 })
  courseDisciplinesRepository.create(courseDiscipline1)
  courseDisciplinesRepository.create(courseDiscipline2)
  courseDisciplinesRepository.create(courseDiscipline3)

  return new GetStudentAverageInTheCourseUseCase (
    assessmentsRepository,
    behaviorsRepository,
    courseDisciplinesRepository
  )
}

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
    const course = makeCourse({ formule: 'period' }, new UniqueEntityId('course-1'))
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

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
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
    })
  })
})