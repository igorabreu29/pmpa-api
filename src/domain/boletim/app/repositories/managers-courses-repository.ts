import { ManagerCourse } from "../../enterprise/entities/manager-course.ts";
import { ManagerWithCourseAndPole } from "../../enterprise/entities/value-objects/manager-with-course-and-pole.ts";
import { ManagerWithCourse } from "../../enterprise/entities/value-objects/manager-with-course.ts";

export abstract class ManagersCoursesRepository {
  abstract findByManagerIdAndCourseId({ managerId, courseId }: { managerId: string, courseId: string }): Promise<ManagerCourse | null>
  abstract findManyByCourseIdWithCourseAndPole({
    courseId,
    page,
    perPage
  }: {
    courseId: string
    page: number
    perPage: number
  }): Promise<{
    managersCourse: ManagerWithCourseAndPole[]
    pages: number
    totalItems: number
  }>
  abstract findManyByManagerIdWithCourse({
    managerId,
    page,
    perPage
  }: {
    managerId: string
    page: number
    perPage: number
  }): Promise<{
    managerCourses: ManagerWithCourse[],
    pages: number
    totalItems: number
  }>
  abstract create(managerCourse: ManagerCourse): Promise<void>
}