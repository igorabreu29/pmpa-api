import { CourseHistoric } from "@/domain/boletim/enterprise/entities/course-historic.ts";

export abstract class CourseHistoricRepository {
  abstract findById(id: string): Promise<CourseHistoric | null>
  abstract findByCourseId(courseId: string): Promise<CourseHistoric | null>
  abstract create(courseHistoric: CourseHistoric): Promise<void>
  abstract delete(courseHistoric: CourseHistoric): Promise<void>
}