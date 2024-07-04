import { ManagerCourse } from "../../enterprise/entities/manager-course.ts";

export abstract class ManagersCoursesRepository {
  abstract findByManagerIdAndCourseId({ managerId, courseId }: { managerId: string, courseId: string }): Promise<ManagerCourse | null>
  abstract create(managerCourse: ManagerCourse): Promise<void>
}