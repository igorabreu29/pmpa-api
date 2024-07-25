import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { ManagerCourse } from '@/domain/boletim/enterprise/entities/manager-course.ts';
import { Prisma, UserOnCourse } from '@prisma/client'

export class PrismaManagersCoursesMapper {
  static toDomain(managerCourse: UserOnCourse): ManagerCourse {
    return ManagerCourse.create({
      courseId: new UniqueEntityId(managerCourse.courseId),
      managerId: new UniqueEntityId(managerCourse.userId),
      createdAt: managerCourse.createdAt
    }, new UniqueEntityId(managerCourse.id))
  }

  static toPrisma(managerCourse: ManagerCourse): Prisma.UserOnCourseUncheckedCreateInput {
    return {
      id: managerCourse.id.toValue(),
      courseId: managerCourse.courseId.toValue(),
      userId: managerCourse.managerId.toValue(),
      createdAt: managerCourse.createdAt
    }
  }
}