import { CourseDiscipline } from "@/domain/enterprise/entities/course-discipline.ts";

export interface DisciplineByCourseIdAndDisciplineId {
  courseId: string
  disciplineId: string
}

export abstract class CourseDisciplinesRepository {
  abstract findByCourseIdAndDisciplineId({ courseId, disciplineId }: DisciplineByCourseIdAndDisciplineId): Promise<CourseDiscipline | null>
  abstract create(courseDiscipline: CourseDiscipline): Promise<void>
  abstract createMany(courseDisciplines: CourseDiscipline[]): Promise<void>
}