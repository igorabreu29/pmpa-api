import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { CoursePole } from '@/domain/boletim/enterprise/entities/course-pole.ts';
import { Prisma, CourseOnPole } from '@prisma/client'

export class PrismaCoursesPolesMapper {
  static toDomain(coursePole: CourseOnPole): CoursePole {
    return CoursePole.create({
      poleId: new UniqueEntityId(coursePole.poleId),
      courseId: new UniqueEntityId(coursePole.courseId),
    }, new UniqueEntityId(coursePole.id))
  }

  static toPrisma(coursePole: CoursePole): Prisma.UserCourseOnPoleUncheckedCreateInput {
    return {
      id: coursePole.id.toValue(),
      poleId: coursePole.poleId.toValue(),
      userOnCourseId: coursePole.courseId.toValue(),
    }
  }
}