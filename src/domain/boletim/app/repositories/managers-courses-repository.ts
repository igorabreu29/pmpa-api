import { ManagerCourse } from "../../enterprise/entities/manager-course.ts";
import { ManagerCourseDetails } from "../../enterprise/entities/value-objects/manager-course-details.ts";
import { ManagerWithCourse } from "../../enterprise/entities/value-objects/manager-with-course.ts";

export abstract class ManagersCoursesRepository {
  abstract findByCourseId({ courseId }: { courseId: string }): Promise<ManagerCourse | null>
  abstract findByManagerIdAndCourseId({ managerId, courseId }: { managerId: string, courseId: string }): Promise<ManagerCourse | null>
  abstract findDetailsByManagerAndCourseId({ managerId, courseId }: { managerId: string, courseId: string }): Promise<ManagerCourseDetails | null>
  abstract findManyDetailsByCourseId({
    courseId,
    page,
    cpf,
    isEnabled,
    username,
    perPage
  }: {
    courseId: string
    page?: number
    cpf?: string
    username?: string
    isEnabled?: boolean
    perPage?: number
  }): Promise<{
    managersCourse: ManagerCourseDetails[]
    pages?: number
    totalItems?: number
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
  abstract updateStatus(managerCourse: ManagerCourse): Promise<void>
  abstract delete(managerCourse: ManagerCourse): Promise<void>
}