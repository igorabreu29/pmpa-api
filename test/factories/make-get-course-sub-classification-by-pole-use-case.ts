import { GetCourseSubClassificationByPoleUseCase } from "@/domain/boletim/app/use-cases/get-course-sub-classification-by-pole.ts";
import type { GetStudentAverageInTheCourseUseCase } from "@/domain/boletim/app/use-cases/get-student-average-in-the-course.ts";
import type { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import type { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import type { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import type { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";

interface MakeGetCourseSubClassificationByPoleUseCaseProps {
  coursesRepository: InMemoryCoursesRepository
  polesRepository: InMemoryPolesRepository,
  managerCoursesRepository: InMemoryManagersCoursesRepository,
  studentPolesRepository: InMemoryStudentsPolesRepository
  getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
}

export function makeGetCourseSubClassificationByPoleUseCase({
  coursesRepository,
  polesRepository,
  managerCoursesRepository,
  studentPolesRepository,
  getStudentAverageInTheCourseUseCase
}: MakeGetCourseSubClassificationByPoleUseCaseProps) {
  return new GetCourseSubClassificationByPoleUseCase(
    coursesRepository,
    polesRepository,
    managerCoursesRepository,
    studentPolesRepository,
    getStudentAverageInTheCourseUseCase
  )
}