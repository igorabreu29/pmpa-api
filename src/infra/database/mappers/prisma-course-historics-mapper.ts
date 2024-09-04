import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { CourseHistoric } from '@/domain/boletim/enterprise/entities/course-historic.ts';
import { Prisma, CourseHistoric as PrismaCourseHistoric } from '@prisma/client'

export class PrismaCourseHistoricsMapper {
  static toDomain(courseHistoric: PrismaCourseHistoric): CourseHistoric {
    return CourseHistoric.create({
      courseId: new UniqueEntityId(courseHistoric.courseId),
      className: courseHistoric.classname,
      finishDate: courseHistoric.finishDate,
      startDate: courseHistoric.startDate,
      commander: courseHistoric.commander ?? undefined,
      divisionBoss: courseHistoric.divisionBoss ?? undefined,
      internships: courseHistoric.internships ?? undefined,
      speechs: courseHistoric.speechs ?? undefined,
      totalHours: courseHistoric.totalHours ?? undefined
    }, new UniqueEntityId(courseHistoric.id))
  }

  static toPrisma(courseHistoric: CourseHistoric): Prisma.CourseHistoricUncheckedCreateInput {
    return {
      id: courseHistoric.id.toValue(),
      courseId: courseHistoric.courseId.toValue(),
      classname: courseHistoric.className,
      finishDate: courseHistoric.finishDate,
      startDate: courseHistoric.startDate,
      commander: courseHistoric.commander,
      divisionBoss: courseHistoric.commander,
      internships: courseHistoric.internships,
      speechs: courseHistoric.speechs,
      totalHours: courseHistoric.totalHours
    }
  }
}