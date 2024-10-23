import { GetManagerAssessmentClassificationUseCase } from "@/domain/boletim/app/use-cases/get-manager-assessment-classification.ts";
import { GetStudentAverageInTheCourseUseCase } from "@/domain/boletim/app/use-cases/get-student-average-in-the-course.ts";
import type { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import type { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import type { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";

interface makeGetManagerAssessmentClassificationUseCaseProps {
  coursesRepository: InMemoryCoursesRepository
  managerCoursesRepository: InMemoryManagersCoursesRepository
  studentCoursesRepository: InMemoryStudentsCoursesRepository
  getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
}

export function makeGetManagerAssessmentClassificationUseCase({
  coursesRepository,
  managerCoursesRepository,
  studentCoursesRepository,
  getStudentAverageInTheCourseUseCase
}: makeGetManagerAssessmentClassificationUseCaseProps) {
  return new GetManagerAssessmentClassificationUseCase(
    coursesRepository,
    managerCoursesRepository,
    studentCoursesRepository,
    getStudentAverageInTheCourseUseCase
  )
}