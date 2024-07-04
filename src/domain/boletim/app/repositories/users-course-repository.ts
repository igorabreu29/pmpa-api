import { UserCourse } from "@/domain/boletim/enterprise/entities/user-course.ts";
import { UserWithPole } from "@/domain/boletim/enterprise/entities/value-objects/user-with-pole.ts";

export abstract class UsersCourseRepository {
  abstract findByUserId(userId: string): Promise<UserCourse[]>
  abstract findByCourseId(courseId: string): Promise<UserCourse[]>
  abstract findByCourseIdAndUserId({ courseId, userId }: { courseId: string, userId: string }): Promise<UserCourse | null>
  abstract create(userCourse: UserCourse): Promise<void>
  abstract createMany(usersOnCourses: UserCourse[]): Promise<void>
}