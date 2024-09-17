import { GetCourseBehaviorClassificationUseCase } from "@/domain/boletim/app/use-cases/get-course-behavior-classification.ts";
import type { InMemoryBehaviorsRepository } from "test/repositories/in-memory-behaviors-repository.ts";
import type { InMemoryCoursesPolesRepository } from "test/repositories/in-memory-courses-poles-repository.ts";
import type { InMemoryCoursesRepository } from "test/repositories/in-memory-courses-repository.ts";
import type { InMemoryStudentsCoursesRepository } from "test/repositories/in-memory-students-courses-repository.ts";

interface MakeGetCourseBehaviorClassificationProps {
  coursesRepository: InMemoryCoursesRepository
  coursesPolesRepository: InMemoryCoursesPolesRepository
  studentCoursesRepository: InMemoryStudentsCoursesRepository
  behaviorsRepository: InMemoryBehaviorsRepository
}

export function makeGetCourseBehaviorClassification({
  coursesRepository,
  coursesPolesRepository,
  studentCoursesRepository,
  behaviorsRepository
}: MakeGetCourseBehaviorClassificationProps) {
  return new GetCourseBehaviorClassificationUseCase(
    coursesRepository,
    coursesPolesRepository,
    studentCoursesRepository,
    behaviorsRepository
  )
}