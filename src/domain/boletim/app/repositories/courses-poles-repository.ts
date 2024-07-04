import { CoursePole } from "../../enterprise/entities/course-pole.ts";

export abstract class CoursesPoleRepository {
  abstract findByCourseIdAndPoleId({ courseId, poleId }: { courseId: string, poleId: string }): Promise<CoursePole | null>
  abstract create(coursePole: CoursePole): Promise<void>
}