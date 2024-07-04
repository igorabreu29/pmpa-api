import { CourseHistoricRepository } from "@/domain/boletim/app/repositories/course-historic-repository.ts";
import { CourseHistoric } from "@/domain/boletim/enterprise/entities/course-historic.ts";

export class InMemoryCourseHistoricRepository implements CourseHistoricRepository {
  public items: CourseHistoric[] = []

  async create(courseHistoric: CourseHistoric): Promise<void> {
    this.items.push(courseHistoric)
  }
}