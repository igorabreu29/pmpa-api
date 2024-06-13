import { InMemoryCoursesRepository } from 'test/repositories/in-memory-courses-repository.ts'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository.ts'
import { describe, it, expect, beforeEach } from 'vitest'
import { GetStudentAverageInTheCourseUseCase } from './get-student-average-in-the-course.ts'
import { makeGetStudentAverageInTheCourseUseCase } from 'test/factories/make-get-student-average-in-the-course-use-case.ts'
import { GetClassificationCourseUseCase } from './get-classification-course.ts'
import { ResourceNotFoundError } from '@/core/errors/use-case/resource-not-found-error.ts'
import { makeCourse } from 'test/factories/make-course.ts'
import { makeUser } from 'test/factories/make-user.ts'
import { makeDiscipline } from 'test/factories/make-discipline.ts'
import { makeAssessment } from 'test/factories/make-assessment.ts'
import { makeBehavior } from 'test/factories/make-behavior.ts'
import { makeCourseDiscipline } from 'test/factories/make-course-discipline.ts'
import { InMemoryAssessmentsRepository } from 'test/repositories/in-memory-assessments-repository.ts'
import { InMemoryBehaviorsRepository } from 'test/repositories/in-memory-behaviors-repository.ts'
import { InMemoryCourseDisciplineRepository } from 'test/repositories/in-memory-course-discipline-repository.ts'

let coursesRepository: InMemoryCoursesRepository
let usersRepository: InMemoryUsersRepository
let getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
let behaviorsRepository: InMemoryBehaviorsRepository
let courseDisciplinesRepository: InMemoryCourseDisciplineRepository
let sut: GetClassificationCourseUseCase

describe('Get Classfication Course Use Case', () => {
  beforeEach(() => {
    coursesRepository = new InMemoryCoursesRepository()
    usersRepository = new InMemoryUsersRepository()
    getStudentAverageInTheCourseUseCase = makeGetStudentAverageInTheCourseUseCase()
    behaviorsRepository = new InMemoryBehaviorsRepository()
    courseDisciplinesRepository = new InMemoryCourseDisciplineRepository()
    sut = new GetClassificationCourseUseCase(
      coursesRepository,
      usersRepository,
      getStudentAverageInTheCourseUseCase
    )
  })

  it ('should not be able to get classification if course does not exist', async () => {
    const result = await sut.execute({
      courseId: 'not-exist',
      role: 'manager'
    })
    
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get classification with user role manager', async () => {
    const assessmentsRepository = new InMemoryAssessmentsRepository()

    const course = makeCourse({ formule: 'period' })
    coursesRepository.create(course)

    const student1 = makeUser({ role: 'student', courses: [course] })
    const student2 = makeUser({ role: 'student', courses: [course] })
    const manager = makeUser({ role: 'manager', courses: [course] })
    usersRepository.createMany([student1, student2, manager])

    const discipline1 = makeDiscipline()
    const discipline2 = makeDiscipline()
    const discipline3 = makeDiscipline()


    const assessment1 = makeAssessment({ courseId: course.id, studentId: student1.id, vf: 7, disciplineId: discipline1.id })
    const assessment2 = makeAssessment({ courseId: course.id, studentId: student1.id, vf: 9, disciplineId: discipline2.id })
    const assessment3 = makeAssessment({ courseId: course.id, studentId: student1.id, vf: 8.5, disciplineId: discipline3.id })
    const assessment4 = makeAssessment({ courseId: course.id, studentId: student2.id, vf: 7.2, disciplineId: discipline1.id })
    const assessment5 = makeAssessment({ courseId: course.id, studentId: student2.id, vf: 6.6, disciplineId: discipline2.id })
    const assessment6 = makeAssessment({ courseId: course.id, studentId: student2.id, vf: 10, disciplineId: discipline3.id })
    assessmentsRepository.createMany([assessment1, assessment2, assessment3, assessment4, assessment5, assessment6])

    const behavior1 = makeBehavior({ january: 5, february: 7, march: 10, april: 7, may: 4.5, jun: 5.75, studentId: student1.id, courseId: course.id })
    const behavior2 = makeBehavior({ january: 5, february: 7, march: 3, april: 7, may: 4.5, jun: 7.75, studentId: student2.id, courseId: course.id })
    behaviorsRepository.create(behavior1)
    behaviorsRepository.create(behavior2)

    const courseDiscipline1 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline1.id, module: 1 })
    const courseDiscipline2 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline2.id, module: 2 })
    const courseDiscipline3 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline3.id, module: 3 })
    courseDisciplinesRepository.createMany([courseDiscipline1, courseDiscipline2, courseDiscipline3])

    const result = await sut.execute({
      courseId: course.id.toValue(),
      role: 'manager'
    })

    expect(result.isRight()).toBe(true)
  })
})