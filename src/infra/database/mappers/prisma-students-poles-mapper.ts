import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { StudentCourse } from '@/domain/boletim/enterprise/entities/student-course.ts';
import { StudentPole } from '@/domain/boletim/enterprise/entities/student-pole.ts';
import { Prisma, UserCourseOnPole } from '@prisma/client'

export class PrismaStudentCourseMapper {
  static toDomain(studentPole: UserCourseOnPole): StudentPole {
    return StudentPole.create({
      poleId: new UniqueEntityId(studentPole.poleId),
      studentId: new UniqueEntityId(studentPole.id),
      createdAt: studentPole.createdAt
    }, new UniqueEntityId(studentPole.id))
  }

  static toPrisma(studentPole: StudentPole): Prisma.UserCourseOnPoleUncheckedCreateInput {
    return {
      id: studentPole.id.toValue(),
      poleId: studentPole.poleId.toValue(),
      userOnCourseId: studentPole.studentId.toValue(),
      createdAt: studentPole.createdAt
    }
  }
}