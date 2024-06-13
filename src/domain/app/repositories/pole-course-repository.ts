import { CoursePole } from "@/domain/enterprise/entities/course-pole.ts";

export abstract class CoursePolesRepository {
  abstract findByPoleId(poleId: string): Promise<CoursePole | null>
  abstract findByCourseIdAndPoleId(courseId: string, poleId: string): Promise<CoursePole | null>
  abstract create(coursePole: CoursePole): Promise<void>
  abstract createMany(coursePoles: CoursePole[]): Promise<void>
}