import { CourseDisciplinesRepository, DisciplineByCourseIdAndDisciplineId } from "@/domain/app/repositories/course-discipline-repository.ts";
import { CourseDiscipline } from "@/domain/enterprise/entities/course-discipline.ts";

export class InMemoryCourseDisciplineRepository implements CourseDisciplinesRepository {
  public items: CourseDiscipline[] = []

  async findByCourseIdAndDisciplineId({ courseId, disciplineId }: DisciplineByCourseIdAndDisciplineId): Promise<CourseDiscipline | null> {
    const courseDiscipline = this.items.find(item => item.courseId.toValue() === courseId && item.disciplineId.toValue() === disciplineId)
    return courseDiscipline ?? null
  }

  async create(courseDiscipline: CourseDiscipline): Promise<void> {
    this.items.push(courseDiscipline)
  }

  async createMany(courseDisciplines: CourseDiscipline[]): Promise<void> {
    courseDisciplines.forEach(courseDiscipline => {
      this.items.push(courseDiscipline)
    })
  }
}