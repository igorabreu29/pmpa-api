import { CourseHistoricRepository } from "@/domain/boletim/app/repositories/course-historic-repository.ts";
import { CourseHistoric } from "@/domain/boletim/enterprise/entities/course-historic.ts";

export class InMemoryCourseHistoricRepository implements CourseHistoricRepository {
  public items: CourseHistoric[] = []

  async findById(id: string): Promise<CourseHistoric | null> {
    const courseHistoric = this.items.find(item => item.id.toValue() === id)
    return courseHistoric ?? null
  }

  async findByCourseId(courseId: string): Promise<CourseHistoric | null> {
    const courseHistoric = this.items.find(item => item.courseId.toValue() === courseId)
    return courseHistoric ?? null
  }

  async create(courseHistoric: CourseHistoric): Promise<void> {
    this.items.push(courseHistoric)
  }

  async delete(courseHistoric: CourseHistoric): Promise<void> {
    const courseHistoricIndex = this.items.findIndex(item => item.equals(courseHistoric))
    this.items.splice(courseHistoricIndex, 1)
  }
}