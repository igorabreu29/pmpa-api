import { GetCourseAssessmentClassificationUseCase } from "@/domain/boletim/app/use-cases/get-course-assessment-classification.ts";
import { GetStudentAverageInTheCourseUseCase } from "@/domain/boletim/app/use-cases/get-student-average-in-the-course.ts";
import type { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import type { InMemoryCoursesPolesRepository } from "test/repositories/in-memory-courses-poles-repository.ts";
import type { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import type { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";

interface MakeGetCourseAssessmentClassificationProps {
  coursesRepository: InMemoryCoursesRepository
  studentCoursesRepository: InMemoryStudentsCoursesRepository
  getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
}

export function makeGetCourseAssessmentClassification({
  coursesRepository,
  studentCoursesRepository,
  getStudentAverageInTheCourseUseCase
}: MakeGetCourseAssessmentClassificationProps) {
  return new GetCourseAssessmentClassificationUseCase(
    coursesRepository,
    studentCoursesRepository,
    getStudentAverageInTheCourseUseCase
  )
}