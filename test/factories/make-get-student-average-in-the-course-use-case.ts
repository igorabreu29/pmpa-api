import { GetStudentAverageInTheCourseUseCase } from "@/domain/boletim/app/use-cases/get-student-average-in-the-course.ts"
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts"
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts"
import { InMemoryCourseDisciplineRepository } from "test/repositories/in-memory-course-discipline-repository.ts"
import { makeAssessment } from "./make-assessment.ts"
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { makeDiscipline } from "./make-discipline.ts"
import { makeCourseDiscipline } from "./make-course-discipline.ts"
import { makeBehavior } from "./make-behavior.ts"

export function makeGetStudentAverageInTheCourseUseCase() {
  const assessmentsRepository = new InMemoryAssessmentsRepository()

  const discipline1 = makeDiscipline()
  const discipline2 = makeDiscipline()
  const discipline3 = makeDiscipline()

  const assessment1 = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-1'), vf: 7, disciplineId: discipline1.id })
  const assessment2 = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-1'), vf: 9, disciplineId: discipline2.id })
  const assessment3 = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-1'), vf: 8.5, disciplineId: discipline3.id })
  const assessment4 = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-2'), vf: 7.2, disciplineId: discipline1.id })
  const assessment5 = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-2'), vf: 6.6, disciplineId: discipline2.id })
  const assessment6 = makeAssessment({ courseId: new UniqueEntityId('course-1'), studentId: new UniqueEntityId('student-2'), vf: 10, disciplineId: discipline3.id })
  assessmentsRepository.items.push(assessment1)
  assessmentsRepository.items.push(assessment2)
  assessmentsRepository.items.push(assessment3)
  assessmentsRepository.items.push(assessment4)
  assessmentsRepository.items.push(assessment5)
  assessmentsRepository.items.push(assessment6)

  const behaviorsRepository = new InMemoryBehaviorsRepository()

  const behavior1 = makeBehavior({ january: 5, february: 7, march: 10, april: 7, may: 4.5, jun: 5.75, studentId: new UniqueEntityId('student-1'), courseId: new UniqueEntityId('course-1') })
  const behavior2 = makeBehavior({ january: 5, february: 7, march: 3, april: 7, may: 4.5, jun: 7.75, studentId: new UniqueEntityId('student-2'), courseId: new UniqueEntityId('course-1') })
  behaviorsRepository.items.push(behavior1)
  behaviorsRepository.items.push(behavior2)

  const courseDisciplineRepository = new InMemoryCourseDisciplineRepository()

  const courseDiscipline1 = makeCourseDiscipline({ courseId: new UniqueEntityId('course-1'), disciplineId: discipline1.id, module: 1 })
  const courseDiscipline2 = makeCourseDiscipline({ courseId: new UniqueEntityId('course-1'), disciplineId: discipline2.id, module: 2 })
  const courseDiscipline3 = makeCourseDiscipline({ courseId: new UniqueEntityId('course-1'), disciplineId: discipline3.id, module: 3 })
  courseDisciplineRepository.createMany([courseDiscipline1, courseDiscipline2, courseDiscipline3])

  return new GetStudentAverageInTheCourseUseCase (
    assessmentsRepository,
    behaviorsRepository,
    courseDisciplineRepository
  )
}