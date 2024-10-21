import { GetCourseClassificationByPoleUseCase } from "@/domain/boletim/app/use-cases/get-course-classification-by-pole.ts";
import type { GetStudentAverageInTheCourseUseCase } from "@/domain/boletim/app/use-cases/get-student-average-in-the-course.ts";
import type { InMemoryClassificationsRepository } from "test/repositories/in-memory-classifications-repository.ts";
import type { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import type { InMemoryManagersCoursesRepository } from "test/repositories/in-memory-managers-courses-repository.ts";
import type { InMemoryPolesRepository } from "test/repositories/in-memory-poles-repository.ts";
import type { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";
import type { InMemoryStudentsPolesRepository } from "test/repositories/in-memory-students-poles-repository.ts";

interface MakeGetCourseClassificationByPoleUseCaseProps {
  coursesRepository: InMemoryCoursesRepository
  polesRepository: InMemoryPolesRepository,
  managerCoursesRepository: InMemoryManagersCoursesRepository,
  studentCoursesRepository: InMemoryStudentsCoursesRepository
  classificationsRepository: InMemoryClassificationsRepository
}

export function makeGetCourseClassificationByPoleUseCase({
  coursesRepository,
  polesRepository,
  managerCoursesRepository,
  studentCoursesRepository,
  classificationsRepository
}: MakeGetCourseClassificationByPoleUseCaseProps) {
  return new GetCourseClassificationByPoleUseCase(
    coursesRepository,
    polesRepository,
    managerCoursesRepository,
    studentCoursesRepository,
    classificationsRepository
  )
}