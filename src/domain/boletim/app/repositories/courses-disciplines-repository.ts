import { CourseDiscipline } from "../../enterprise/entities/course-discipline.ts";

export abstract class CoursesDisciplinesRepository {
  abstract findByCourseIdAndDisciplineId({ courseId, disciplineId }: { courseId: string, disciplineId: string }): Promise<CourseDiscipline | null>
  abstract create(courseDiscipline: CourseDiscipline): Promise<void>
  abstract createMany(coursesDisciplines: CourseDiscipline[]): Promise<void>
}