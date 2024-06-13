import { GetStudentAverageInTheCourseUseCase } from "@/domain/app/use-cases/get-student-average-in-the-course.ts"
import { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts"
import { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts"
import { InMemoryCourseDisciplineRepository } from "test/repositories/in-memory-course-discipline-repository.ts"

export function makeGetStudentAverageInTheCourseUseCase() {
  const assessmentsRepository = new InMemoryAssessmentsRepository()
  const behaviorsRepository = new InMemoryBehaviorsRepository()
  const courseDisciplineRepository = new InMemoryCourseDisciplineRepository()
  return new GetStudentAverageInTheCourseUseCase (
    assessmentsRepository,
    behaviorsRepository,
    courseDisciplineRepository
  )
}