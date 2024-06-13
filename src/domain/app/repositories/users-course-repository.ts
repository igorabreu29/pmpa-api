import { UserCourse } from "@/domain/enterprise/entities/user-course.ts";

export abstract class UsersCourseRepository {
  abstract findByUserId(userId: string): Promise<UserCourse[]>
  abstract findByCourseId(courseId: string): Promise<UserCourse[]>
  abstract findByCourseIdAndUserId({ courseId, userId }: { courseId: string, userId: string }): Promise<UserCourse | null>
  abstract create(userCourse: UserCourse): Promise<void>
}