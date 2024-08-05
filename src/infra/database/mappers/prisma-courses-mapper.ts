import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { Course } from '@/domain/boletim/enterprise/entities/course.ts';
import { EndsAt } from '@/domain/boletim/enterprise/entities/value-objects/ends-at.ts';
import { Name } from '@/domain/boletim/enterprise/entities/value-objects/name.ts';
import { Prisma, Course as PrismaCourse } from '@prisma/client'

export class PrismaCoursesMapper {
  static toDomain(course: PrismaCourse): Course {
    const nameOrError = Name.create(course.name)
    const endsAtOrError = EndsAt.create(course.endsAt)

    if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)
    if (endsAtOrError.isLeft()) throw new Error(endsAtOrError.value.message)

    const courseOrError = Course.create({
      name: nameOrError.value,
      endsAt: endsAtOrError.value,
      formula: course.formula,
      imageUrl: course.imageUrl,
      isActive: course.isActive,
      isPeriod: course.isPeriod,
      startAt: course.startAt
    }, new UniqueEntityId(course.id))
    if (courseOrError.isLeft()) throw new Error(courseOrError.value.message)
    
    return courseOrError.value
  }

  static toPrisma(course: Course): Prisma.CourseUncheckedCreateInput {
    return {
      id: course.id.toValue(),
      name: course.name.value,
      endsAt: course.endsAt.value,
      formula: course.formula,
      imageUrl: course.imageUrl,
      isActive: course.isActive,
      isPeriod: course.isPeriod
    }
  }
}