import { CoursesDisciplinesRepository } from "@/domain/boletim/app/repositories/courses-disciplines-repository.ts";
import { CourseDiscipline } from "@/domain/boletim/enterprise/entities/course-discipline.ts";

export class InMemoryCoursesDisciplinesRepository implements CoursesDisciplinesRepository {
  public items: CourseDiscipline[] = []

  async findByCourseIdAndDisciplineId({ courseId, disciplineId }: { courseId: string; disciplineId: string; }): Promise<CourseDiscipline | null> {
    const courseDiscipline = this.items.find(item => item.courseId.toValue() === courseId && item.disciplineId.toValue() === disciplineId)
    return courseDiscipline ?? null
  }

  async create(courseDiscipline: CourseDiscipline): Promise<void> {
    this.items.push(courseDiscipline)
  }
}