import { GetCourseClassificationByPoleUseCase } from "@/domain/boletim/app/use-cases/get-course-classification-by-pole.ts";
import type { GetStudentAverageInTheCourseUseCase } from "@/domain/boletim/app/use-cases/get-student-average-in-the-course.ts";
import type { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import type { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import type { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import type { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import type { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";

interface MakeGetCourseClassificationByPoleUseCaseProps {
  coursesRepository: InMemoryCoursesRepository
  polesRepository: InMemoryPolesRepository,
  managerCoursesRepository: InMemoryManagersCoursesRepository,
  studentPolesRepository: InMemoryStudentsPolesRepository
  getStudentAverageInTheCourseUseCase: GetStudentAverageInTheCourseUseCase
}

export function makeGetCourseClassificationByPoleUseCase({
  coursesRepository,
  polesRepository,
  managerCoursesRepository,
  studentPolesRepository,
  getStudentAverageInTheCourseUseCase
}: MakeGetCourseClassificationByPoleUseCaseProps) {
  return new GetCourseClassificationByPoleUseCase(
    coursesRepository,
    polesRepository,
    managerCoursesRepository,
    studentPolesRepository,
    getStudentAverageInTheCourseUseCase
  )
}