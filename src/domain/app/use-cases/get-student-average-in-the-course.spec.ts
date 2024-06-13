import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { describe, it, expect, beforeEach } from "vitest";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { makeUser } from "test/factories/make-user.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import { InMemoryCourseDisciplineRepository } from "test/repositories/in-memory-course-discipline-repository.ts";
import { makeBehavior } from "test/factories/make-behavior.ts";
import { makeCourseDiscipline } from "test/factories/make-course-discipline.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";

let assessmentsRepository: InMemoryAssessmentsRepository
let behaviorsRepository: InMemoryBehaviorsRepository
let courseDisciplinesRepository: InMemoryCourseDisciplineRepository
let sut: GetStudentAverageInTheCourseUseCase

describe(('Get Student Average In The Course Use Case'), () => {
  beforeEach(() => {
    assessmentsRepository = new InMemoryAssessmentsRepository()
    behaviorsRepository = new InMemoryBehaviorsRepository()
    courseDisciplinesRepository = new InMemoryCourseDisciplineRepository()
    sut = new GetStudentAverageInTheCourseUseCase(
      assessmentsRepository, 
      behaviorsRepository,
      courseDisciplinesRepository
    )
  })

  it ('should be able to get student average with role manager', async () => {
    const course = makeCourse()
    const student = makeUser({ role: 'student', courses: [course] })
    const manager = makeUser({ role: 'manager', courses: [course] })
    const discipline = makeDiscipline()

    const assessment = makeAssessment({ courseId: course.id, studentId: student.id, vf: 7, disciplineId: discipline.id })
    assessmentsRepository.create(assessment)

    const behavior = makeBehavior({ january: 5, february: 7, march: 10, april: 7, may: 4.5, jun: 5.75, studentId: student.id, courseId: course.id })
    behaviorsRepository.create(behavior)

    const courseDiscipline = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline.id, module: 1 })
    courseDisciplinesRepository.create(courseDiscipline)

    const result = await sut.execute({
      userRole: 'manager',
      courseId: manager.courses[0].id.toValue(),
      studentId: student.id.toValue(),
      studentCourseId: student.courses[0].id.toValue(),
      courseFormule: 'module',
    })

    expect(result.value?.grades).toMatchObject({
      averageInform: {
        geralAverage: 6.771,
        behaviorAverageStatus:       {
          behaviorAverage: 6.542, status: 'approved'
        },
        status: {
          concept: 'regular',
          status: 'approved'
        }
      },

      assessments: [
        expect.objectContaining({
          id: assessment.id.toValue()
        })
      ]
    })
  })

  it ('should be able to get student average with role admin', async () => {
    const course = makeCourse({ formule: 'period' })
    const student = makeUser({ role: 'student', courses: [course] })
    const discipline = makeDiscipline()

    const assessment = makeAssessment({ courseId: course.id, disciplineId: discipline.id, studentId: student.id, vf: 7 })
    assessmentsRepository.create(assessment)

    const behavior = makeBehavior({ january: 5, february: 7, march: 10, april: 7, may: 4.5, jun: 5.75, studentId: student.id, courseId: course.id })
    behaviorsRepository.create(behavior)

    const courseDiscipline = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline.id, module: 1 })
    courseDisciplinesRepository.create(courseDiscipline)

    const result = await sut.execute({
      studentId: student.id.toValue(),
      studentCourseId: course.id.toValue(),
      courseFormule: 'period',
    })

    expect(result.value?.grades).toMatchObject({
      averageInform: {
        geralAverage: 6.771,
        behaviorAverageStatus: [
          {
            behaviorAverage: 6.542, status: 'approved'
          }
        ],
        status: {
          concept: 'regular',
          status: 'approved'
        }
      },

      assessments: {
        module1: [
          expect.objectContaining({
            id: assessment.id.toValue()
          })
        ]
      }
    })
  })
})