import { CoursePole } from "../../enterprise/entities/course-pole.ts";
import { Pole } from "../../enterprise/entities/pole.ts";

export abstract class CoursesPoleRepository {
  abstract findByCourseIdAndPoleId({ courseId, poleId }: { courseId: string, poleId: string }): Promise<CoursePole | null>
  abstract findManyByCourseId({ courseId }: { courseId: string }): Promise<Pole[]>
  abstract create(coursePole: CoursePole): Promise<void>
  abstract createMany(coursesPoles: CoursePole[]): Promise<void>
}