import { CourseHistoric } from "@/domain/boletim/enterprise/entities/course-historic.ts";

export abstract class CourseHistoricRepository {
  abstract create(courseHistoric: CourseHistoric): Promise<void>
}