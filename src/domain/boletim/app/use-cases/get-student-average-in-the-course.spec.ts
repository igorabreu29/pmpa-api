import { describe, it, expect, beforeEach } from "vitest";
import { GetStudentAverageInTheCourseUseCase } from "./get-student-average-in-the-course.ts";
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import { InMemoryCourseDisciplineRepository } from "test/repositories/in-memory-course-discipline-repository.ts";
import { makeUser } from "test/factories/make-user.ts";
import { makeCourse } from "test/factories/make-course.ts";
import { makeAssessment } from "test/factories/make-assessment.ts";
import { makeBehavior } from "test/factories/make-behavior.ts";
import { makeCourseDiscipline } from "test/factories/make-course-discipline.ts";
import { makeDiscipline } from "test/factories/make-discipline.ts";
import { ResourceNotFoundError } from "@/core/errors/use-case/resource-not-found-error.ts";

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

  it ('should not be able to obtain student average if the course does not have module', async () => {
    const course = makeCourse()
    const student = makeUser({ role: 'student' })
    const discipline1 = makeDiscipline()
    const discipline2 = makeDiscipline()

    const assessment1 = makeAssessment({ courseId: course.id, studentId: student.id, vf: 7, disciplineId: discipline1.id })
    assessmentsRepository.create(assessment1)

    const assessment2 = makeAssessment({ courseId: course.id, studentId: student.id, vf: 7, disciplineId: discipline2.id })
    assessmentsRepository.create(assessment2)

    const behavior = makeBehavior({ january: 5, february: 7, march: 10, april: 7, may: 4.5, jun: 5.75, studentId: student.id, courseId: course.id })
    behaviorsRepository.create(behavior)

    const courseDiscipline1 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline1.id, module: 1 })
    courseDisciplinesRepository.create(courseDiscipline1)
    
    const result = await sut.execute({
      courseId: course.id.toValue(),
      studentId: student.id.toValue(),
      courseFormule: 'module',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it ('should be able to get student average with module formule', async () => {
    const course = makeCourse()
    const student = makeUser({ role: 'student' })
    const discipline1 = makeDiscipline()
    const discipline2 = makeDiscipline()

    const assessment1 = makeAssessment({ courseId: course.id, studentId: student.id, vf: 7, disciplineId: discipline1.id })
    assessmentsRepository.create(assessment1)

    const assessment2 = makeAssessment({ courseId: course.id, studentId: student.id, vf: 7, disciplineId: discipline2.id })
    assessmentsRepository.create(assessment2)

    const behavior = makeBehavior({ january: 5, february: 7, march: 10, april: 7, may: 4.5, jun: 5.75, studentId: student.id, courseId: course.id })
    behaviorsRepository.create(behavior)

    const courseDiscipline1 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline1.id, module: 1 })
    courseDisciplinesRepository.create(courseDiscipline1)
    const courseDiscipline2 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline2.id, module: 1 })
    courseDisciplinesRepository.create(courseDiscipline2)

    const result = await sut.execute({
      courseId: course.id.toValue(),
      studentId: student.id.toValue(),
      courseFormule: 'module',
    })

    expect(result.value).toMatchObject({
      grades: {
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
            id: assessment1.id.toValue()
          }),
          expect.objectContaining({
            id: assessment2.id.toValue()
          })
        ]
      }
    })
  })

  it ('should be able to get student average with period formule', async () => {
    const course = makeCourse({ formule: 'period' })
    const student = makeUser({ role: 'student' })
    const discipline1 = makeDiscipline()
    const discipline2 = makeDiscipline()

    const assessment1 = makeAssessment({ courseId: course.id, disciplineId: discipline1.id, studentId: student.id, vf: 7 })
    const assessment2 = makeAssessment({ courseId: course.id, disciplineId: discipline2.id, studentId: student.id, vf: 5 })
    assessmentsRepository.createMany([assessment1, assessment2])

    const behavior = makeBehavior({ january: 5, february: 7, march: 10, april: 7, may: 4.5, jun: 5.75, studentId: student.id, courseId: course.id })
    behaviorsRepository.create(behavior)

    const courseDiscipline1 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline1.id, module: 1 })
    const courseDiscipline2 = makeCourseDiscipline({ courseId: course.id, disciplineId: discipline2.id, module: 1 })
    courseDisciplinesRepository.createMany([courseDiscipline1, courseDiscipline2])

    const result = await sut.execute({
      studentId: student.id.toValue(),
      courseFormule: 'period',
      courseId: course.id.toValue()
    })

    expect(result.value).toMatchObject({
      grades: {
        averageInform: {
          geralAverage: 6.181,
          behaviorAverageStatus: [
            {
              behaviorAverage: 6.542, status: 'approved'
            }
          ],
          behaviorsCount: 6,
          status: {
            concept: 'regular',
            status: 'approved'
          }
        },
  
        assessments: {
          module1: [
            expect.objectContaining({
              id: assessment1.id.toValue()
            }),
            expect.objectContaining({
              id: assessment2.id.toValue()
            })
          ]
        }
      }
    })
  })
})