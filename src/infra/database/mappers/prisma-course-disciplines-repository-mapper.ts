import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { CourseDiscipline } from '@/domain/boletim/enterprise/entities/course-discipline.ts';
import { Prisma, CourseOnDiscipline } from '@prisma/client'

export class PrismaCourseDisciplinesMapper {
  static toDomain(courseDiscipline: CourseOnDiscipline): CourseDiscipline {
    return CourseDiscipline.create({
      disciplineId: new UniqueEntityId(courseDiscipline.disciplineId),
      courseId: new UniqueEntityId(courseDiscipline.courseId),
      expected: courseDiscipline.expected,
      hours: courseDiscipline.hours,
      module: courseDiscipline.module
    }, new UniqueEntityId(courseDiscipline.id))
  }

  static toPrisma(courseDiscipline: CourseDiscipline): Prisma.CourseOnDisciplineUncheckedCreateInput {
    return {
      id: courseDiscipline.id.toValue(),
      courseId: courseDiscipline.courseId.toValue(),
      disciplineId: courseDiscipline.disciplineId.toValue(),
      expected: courseDiscipline.expected,
      hours: courseDiscipline.hours,
      module: courseDiscipline.module
    }
  }
}