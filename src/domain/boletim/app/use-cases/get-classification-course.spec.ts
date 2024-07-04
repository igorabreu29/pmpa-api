import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { GetStudentAverageInTheCourseUseCase } from './get-student-average-in-the-course.ts'
import { GetClassificationCourseUseCase } from './get-classification-course.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeUser } from 'test/factories/make-user.ts'
import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'

import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts"
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts"
import { InMemoryCourseDisciplineRepository } from "test/repositories/in-memory-course-discipline-repository.ts"
import { makeDiscipline } from 'test/factories/make-discipline.ts'
import { makeAssessment } from 'test/factories/make-assessment.ts'
import { makeBehavior } from 'test/factories/make-behavior.ts'
import { makeCourseDiscipline } from 'test/factories/make-course-discipline.ts'
import { InMemoryUsersCourseRepository } from 'test/repositories/in-memory-users-course-repository.ts'
import { makeUserCourse } from 'test/factories/make-user-course.ts'
import { InMemoryUserPolesRepository } from 'test/repositories/in-memory-user-poles-repository.ts'
import { InMemoryPolesRepository } from 'test/repositories/in-memory-poles-repository.ts'
import { makePole } from 'test/factories/make-pole.ts'
import { makeUserPole } from 'test/factories/make-user-pole.ts'

interface MakeGetStudentAverageInTheCourseUseCase {
  assessmentsRepository: InMemoryAssessmentsRepository
  behaviorsRepository: InMemoryBehaviorsRepository
  courseDisciplinesRepository: InMemoryCourseDisciplineRepository
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
  courseDisciplinesRepository.createMany([courseDiscipline1, courseDiscipline2, courseDiscipline3])

  return new GetStudentAverageInTheCourseUseCase (
    assessmentsRepository,
    behaviorsRepository,
    courseDisciplinesRepository
  )
}

let coursesRepository: InMemoryCoursesRepository
let usersCoursesRepository: InMemoryUsersCourseRepository
let usersPolesRepository: InMemoryUserPolesRepository
let polesRepository: InMemoryPolesRepository
let usersRepository: InMemoryUsersRepository
let assessmentsRepository: InMemoryAssessmentsRepository
let behaviorsRepository: InMemoryBehaviorsRepository
let courseDisciplinesRepository: InMemoryCourseDisciplineRepository
let getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
let sut: GetClassificationCourseUseCase

describe('Get Classfication Course Use Case', () => {
  beforeEach(() => {
    usersCoursesRepository = new InMemoryUsersCourseRepository()
    usersPolesRepository = new InMemoryUserPolesRepository()
    polesRepository = new InMemoryPolesRepository()
    usersRepository = new InMemoryUsersRepository(
      usersCoursesRepository,
      usersPolesRepository,
      polesRepository
    )
    coursesRepository = new InMemoryCoursesRepository (
      usersCoursesRepository
    )
    assessmentsRepository = new InMemoryAssessmentsRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()
    courseDisciplinesRepository = new InMemoryCourseDisciplineRepository()
    getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase({
      assessmentsRepository,
      behaviorsRepository,
      courseDisciplinesRepository
    })
    sut = new GetClassificationCourseUseCase(
      coursesRepository,
      usersRepository,
      getStudentAverageInTheCourseUseCase
    )
  })

  it ('should not be able to get classification if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-exist',
      role: 'manager',
      page: 1
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get classification with user role manager', async () => {
    const course = makeCourse({ formule: 'period' }, new UniqueEntityId('course-1'))
    coursesRepository.create(course)
    
    const pole = makePole({ courseId: course.id })
    polesRepository.items.push(pole)
    
    const student1 = makeUser({ role: 'student', birthday: new Date(2023, 4, 5) }, new UniqueEntityId('student-1'))
    const student2 = makeUser({ role: 'student', birthday: new Date(2021, 4, 5) }, new UniqueEntityId('student-2'))
    const manager = makeUser({ role: 'manager' }, new UniqueEntityId('manager'))
    usersRepository.createMany([student1, student2, manager])

    const student1Pole = makeUserPole({ userId: student1.id, poleId: pole.id })
    const student2Pole = makeUserPole({ userId: student2.id, poleId: pole.id })
    usersPolesRepository.create(student1Pole)
    usersPolesRepository.create(student2Pole)

    const student1Course = makeUserCourse({ userId: student1.id, courseId: course.id })
    const student2Course = makeUserCourse({ userId: student2.id, courseId: course.id })
    const managerCourse = makeUserCourse({ userId: manager.id, courseId: course.id })
    usersCoursesRepository.create(student1Course)
    usersCoursesRepository.create(student2Course)
    usersCoursesRepository.create(managerCourse)

    const result = await sut.execute({
      courseId: 'course-1',
      role: 'manager',
      page: 1,
      poleId: pole.id.toValue()
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      studentsWithAverage: [
        {
          studentAverage: {
            averageInform: {
              geralAverage: 6.771,
              behaviorAverageStatus: [{ behaviorAverage: 6.542, status: 'approved' }],
              status: { concept: 'regular', status: 'approved' }
            },

            assessments: {
              module1: [
                {
                  id: expect.any(String),
                  average: 7,
                }
              ],

              module2: [
                {
                  id: expect.any(String),
                  average: 9,
                }
              ],

              module3: [
                {
                  id: expect.any(String),
                  average: 8.5,
                }
              ],
            },
            assessmentsCount: 3
          }
        },

        {
          studentAverage: {
              averageInform: {
                geralAverage: 6.454,
                behaviorAverageStatus: [{ behaviorAverage: 5.708, status: 'disapproved' }],
                status: { concept: 'regular', status: 'approved' }
              },
  
              assessments: {
                module1: [
                  {
                    id: expect.any(String),
                    average: 7.2,
                  }
                ],
  
                module2: [
                  {
                    id: expect.any(String),
                    average: 6.6,
                  }
                ],
  
                module3: [
                  {
                    id: expect.any(String),
                    average: 10,
                  }
                ],
              },
              assessmentsCount: 3
            },
          }
        ]
    })
  })

  it ('should be able to get classification with user role admin or dev', async () => {
    const course = makeCourse({ formule: 'module' }, new UniqueEntityId('course-1'))
    coursesRepository.create(course)

    const pole1 = makePole({ courseId: course.id })
    const pole2 = makePole({ courseId: course.id })
    polesRepository.createMany([pole1, pole2])

    const student1 = makeUser({ role: 'student', birthday: new Date(2023, 4, 5) }, new UniqueEntityId('student-1'))
    const student2 = makeUser({ role: 'student', birthday: new Date(2021, 4, 5) }, new UniqueEntityId('student-2'))
    const manager = makeUser({ role: 'manager' }, new UniqueEntityId('manager'))
    usersRepository.createMany([student1, student2, manager])

    const student1Course = makeUserCourse({ userId: student1.id, courseId: course.id })
    const student2Course = makeUserCourse({ userId: student2.id, courseId: course.id })
    const managerCourse = makeUserCourse({ userId: manager.id, courseId: course.id })

    usersCoursesRepository.create(student1Course)
    usersCoursesRepository.create(student2Course)
    usersCoursesRepository.create(managerCourse)

    const student1Pole = makeUserPole({ userId: student1.id, poleId: pole1.id })
    const student2Pole = makeUserPole({ userId: student2.id, poleId: pole2.id })
    usersPolesRepository.createMany([student1Pole, student2Pole])

    const result = await sut.execute({
      courseId: 'course-1',
      role: 'dev',
      page: 1
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      studentsWithAverage: [
        {
          studentAverage: {
            averageInform: {
              geralAverage: 7.354,
              behaviorAverageStatus: { behaviorAverage: 6.542, status: 'approved' },
              status: { concept: 'good', status: 'approved' }
            },

            assessments: [
              {
                module: 1,
                average: 7
              },
              {
                module: 2,
                average: 9
              },
              {
                module: 3,
                average: 8.5
              },
            ],
            assessmentsCount: 3
          },
          studentBirthday: expect.any(Date)
        },
        
        {
          studentAverage: {
            averageInform: {
              geralAverage: 6.821,
              behaviorAverageStatus: { behaviorAverage: 5.708, status: 'disapproved' },
              status: { concept: 'regular', status: 'approved' }
            },

            assessments: [
              {
                module: 1,
                average: 7.2
              },
              {
                module: 2,
                average: 6.6
              },
              {
                module: 3,
                average: 10
              },
            ],
            assessmentsCount: 3
          },
          studentBirthday: expect.any(Date)
        },
      ]
    })
  })
})