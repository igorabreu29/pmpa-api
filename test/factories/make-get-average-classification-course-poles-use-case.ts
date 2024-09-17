import { GetAverageClassificationCoursePolesUseCase } from "@/domain/boletim/app/use-cases/get-average-classification-course-poles.ts";
import { GetCourseAssessmentClassificationUseCase } from "@/domain/boletim/app/use-cases/get-course-assessment-classification.ts";
import type { GetStudentAverageInTheCourseUseCase } from "@/domain/boletim/app/use-cases/get-student-average-in-the-course.ts";
import type { InMemoryAssessmentsRepository } from "test/repositories/in-memory-assessments-repository.ts";
import type { InMemoryCoursesPolesRepository } from "test/repositories/in-memory-courses-poles-repository.ts";
import type { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import type { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";

interface MakeGetAverageClassificationCoursePolesUseCase {
  coursesRepository: InMemoryCoursesRepository
  coursePolesRepository: InMemoryCoursesPolesRepository
  studentCoursesRepository: InMemoryStudentsCoursesRepository
  getStudentAverageInTheCourse: GetStudentAverageInTheCourseUseCase
}

export function makeGetAverageClassificationCoursePolesUseCase({
  coursesRepository,
  coursePolesRepository,
  studentCoursesRepository,
  getStudentAverageInTheCourse
}: MakeGetAverageClassificationCoursePolesUseCase) {
  return new GetAverageClassificationCoursePolesUseCase(
    coursesRepository,
    coursePolesRepository,
    studentCoursesRepository,
    getStudentAverageInTheCourse
  )
}