import { GetCourseAssessmentClassificationUseCase } from "@/domain/boletim/app/use-cases/get-course-assessment-classification.ts";
import type { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import type { InMemoryCoursesPolesRepository } from "test/repositories/in-memory-courses-poles-repository.ts";
import type { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import type { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";

interface MakeGetCourseAssessmentClassificationProps {
  coursesRepository: InMemoryCoursesRepository
  coursesPolesRepository: InMemoryCoursesPolesRepository
  studentCoursesRepository: InMemoryStudentsCoursesRepository
  assessmentsRepository: InMemoryAssessmentsRepository
}

export function makeGetCourseAssessmentClassification({
  coursesRepository,
  coursesPolesRepository,
  studentCoursesRepository,
  assessmentsRepository
}: MakeGetCourseAssessmentClassificationProps) {
  return new GetCourseAssessmentClassificationUseCase(
    coursesRepository,
    coursesPolesRepository,
    studentCoursesRepository,
    assessmentsRepository
  )
}