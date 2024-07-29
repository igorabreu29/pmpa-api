import { CourseHistoricRepository } from "@/domain/boletim/app/repositories/course-historic-repository.ts";
import { CourseHistoric } from "@/domain/boletim/enterprise/entities/course-historic.ts";

export class InMemoryCourseHistoricRepository implements CourseHistoricRepository {
  public items: CourseHistoric[] = []

  async findByCourseId(courseId: string): Promise<CourseHistoric | null> {
    const courseHistoric = this.items.find(item => item.courseId.toValue() === courseId)
    return courseHistoric ?? null
  }

  async create(courseHistoric: CourseHistoric): Promise<void> {
    this.items.push(courseHistoric)
  }
}