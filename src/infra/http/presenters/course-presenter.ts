import { Course } from "@/domain/boletim/enterprise/entities/course.ts";
import { Prisma } from '@prisma/client'

export class CoursePresenter {
  static toHTTP(course: Course): Prisma.CourseUncheckedCreateInput {
    return {
      id: course.id.toValue(),
      name: course.name.value,
      endsAt: course.endsAt.value,
      startAt: course.startAt,
      formula: course.formula,
      imageUrl: course.imageUrl,
      isPeriod: course.isPeriod,
      decimalPlaces: course.decimalPlaces
    }
  }
}