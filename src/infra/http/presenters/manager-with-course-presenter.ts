import { ManagerWithCourse } from "@/domain/boletim/enterprise/entities/value-objects/manager-with-course.ts"
import type { Prisma } from "@prisma/client"

type PrismaManagerWithCourse = Prisma.UserUncheckedUpdateInput & {
  course: Prisma.CourseUncheckedUpdateInput
}

export class ManagerWithCoursePresenter {
  static toHTTP(managerWithCourse: ManagerWithCourse): PrismaManagerWithCourse {
    return {
      id: managerWithCourse.managerId.toValue(),
      username: managerWithCourse.username,
      email: managerWithCourse.email,
      cpf: managerWithCourse.cpf,
      course: {
        id: managerWithCourse.courseId.toValue(),
        name: managerWithCourse.course,
        imageUrl: managerWithCourse.imageUrl
      },
    }
  }
}