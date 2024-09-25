import { GetCourseSubClassificationUseCase } from "@/domain/boletim/app/use-cases/get-course-sub-classification.ts";
import type { GetStudentAverageInTheCourseUseCase } from "@/domain/boletim/app/use-cases/get-student-average-in-the-course.ts";
import type { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import type { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";

interface MakeGetCourseSubClassificationUseCaseProps {
  coursesRepository: InMemoryCoursesRepository
  studentCoursesRepository: InMemoryStudentsCoursesRepository
  getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
}

export function makeGetCourseSubClassificationUseCase({
  coursesRepository,
  studentCoursesRepository,
  getStudentAverageInTheCourseUseCase
}: MakeGetCourseSubClassificationUseCaseProps) {
  return new GetCourseSubClassificationUseCase(
    coursesRepository,
    studentCoursesRepository,
    getStudentAverageInTheCourseUseCase
  )
}