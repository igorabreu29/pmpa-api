import { CourseHistoric } from "@/domain/enterprise/entities/course-historic.ts";

export abstract class CourseHistoricRepository {
  abstract create(courseHistoric: CourseHistoric): Promise<void>
}