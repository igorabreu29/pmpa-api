import { UsersCourseRepository } from "@/domain/boletim/app/repositories/users-course-repository.ts";
import { UserWithPole } from "@/domain/boletim/enterprise/entities/value-objects/user-with-pole.ts";
import { UserCourse } from "@/domain/boletim/enterprise/entities/user-course.ts";

export class InMemoryUsersCourseRepository implements UsersCourseRepository {
  public items: UserCourse[] = []

  async findByUserId(userId: string): Promise<UserCourse[]> {
    const usersCourse = this.items.filter((item) => item.userId.toValue() === userId)
    return usersCourse
  }

  async findByCourseId(courseId: string): Promise<UserCourse[]> {
    const usersCourse = this.items.filter((item) => item.courseId.toValue() === courseId)
    return usersCourse
  }

  async findByCourseIdAndUserId({ courseId, userId }: { courseId: string, userId: string }): Promise<UserCourse | null> {
    const userCourse = this.items.find(item => item.courseId.toValue() === courseId && item.userId.toValue() === userId)
    return userCourse ?? null
  }

  async create(userCourse: UserCourse): Promise<void> {
    this.items.push(userCourse)
  }

  async createMany(usersOnCourses: UserCourse[]): Promise<void> {
    usersOnCourses.forEach(userOnCourse => {
      this.items.push(userOnCourse)
    })
  }
}