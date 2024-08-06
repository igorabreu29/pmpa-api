import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { StudentCourse } from '@/domain/boletim/enterprise/entities/student-course.ts';
import { Prisma, UserOnCourse } from '@prisma/client'

export class PrismaStudentCourseMapper {
  static toDomain(studentCourse: UserOnCourse): StudentCourse {
    return StudentCourse.create({
      courseId: new UniqueEntityId(studentCourse.courseId),
      studentId: new UniqueEntityId(studentCourse.userId),
      active: studentCourse.isActive,
      createdAt: studentCourse.createdAt
    }, new UniqueEntityId(studentCourse.id))
  }

  static toPrisma(studentCourse: StudentCourse): Prisma.UserOnCourseUncheckedCreateInput {
    return {
      id: studentCourse.id.toValue(),
      courseId: studentCourse.courseId.toValue(),
      userId: studentCourse.studentId.toValue(),
      isActive: studentCourse.active,
      createdAt: studentCourse.createdAt
    }
  }
}