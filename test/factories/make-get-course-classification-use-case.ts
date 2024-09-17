import { GetCourseClassificationUseCase } from "@/domain/boletim/app/use-cases/get-course-classification.ts";
import type { GetStudentAverageInTheCourseUseCase } from "@/domain/boletim/app/use-cases/get-student-average-in-the-course.ts";
import type { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import type { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";

interface MakeGetCourseClassificationUseCaseProps {
  coursesRepository: InMemoryCoursesRepository
  studentCoursesRepository: InMemoryStudentsCoursesRepository
  getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
}

export function makeGetCourseClassificationUseCase({
  coursesRepository,
  studentCoursesRepository,
  getStudentAverageInTheCourseUseCase
}: MakeGetCourseClassificationUseCaseProps) {
  return new GetCourseClassificationUseCase(
    coursesRepository,
    studentCoursesRepository,
    getStudentAverageInTheCourseUseCase
  )
}