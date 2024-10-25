import { CourseDiscipline } from "../../enterprise/entities/course-discipline.ts";
import type { CourseWithDiscipline } from "../../enterprise/entities/value-objects/course-with-discipline.ts";

export interface FindManyByCourseIdWithDiscipline {
  courseId: string
  search?: string
}

export abstract class CoursesDisciplinesRepository {
  abstract findByCourseAndDisciplineId({ 
    courseId, 
    disciplineId 
  }: { 
    courseId: string
    disciplineId: string 
  }): Promise<CourseDiscipline | null>
  abstract findByCourseIdAndDisciplineIdWithDiscipline({ 
    courseId, 
    disciplineId
  }: { 
    courseId: string
    disciplineId: string 
  }): Promise<CourseWithDiscipline | null>

  abstract findManyByCourseIdWithDiscipliine({ courseId, search }: FindManyByCourseIdWithDiscipline): Promise<CourseWithDiscipline[]>

  abstract create(courseDiscipline: CourseDiscipline): Promise<void>
  abstract createMany(coursesDisciplines: CourseDiscipline[]): Promise<void>

  abstract delete(courseDiscipline: CourseDiscipline): Promise<void>
}