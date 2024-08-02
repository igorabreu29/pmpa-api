import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts"
import { CourseWithDiscipline } from "@/domain/boletim/enterprise/entities/value-objects/course-with-discipline.ts"
import { CourseOnDiscipline as PrismaCourseDiscipline, Discipline as PrismaDiscipline } from "@prisma/client"

type PrismaCourseWithDiscipline = PrismaCourseDiscipline & {
  discipline: PrismaDiscipline
}

export class PrismaCourseWithDisciplineMapper {
  static toDomain(courseWithDiscipline: PrismaCourseWithDiscipline): CourseWithDiscipline {
    return CourseWithDiscipline.create({
      courseId: new UniqueEntityId(courseWithDiscipline.courseId),
      disciplineId: new UniqueEntityId(courseWithDiscipline.discipline.id),
      disciplineName: courseWithDiscipline.discipline.name,
      module: courseWithDiscipline.module
    })
  }
}