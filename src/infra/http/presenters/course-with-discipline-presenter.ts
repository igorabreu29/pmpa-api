import { Discipline } from "@/domain/boletim/enterprise/entities/discipline.ts";
import type { CourseWithDiscipline } from "@/domain/boletim/enterprise/entities/value-objects/course-with-discipline.ts";
import { Discipline as PrismaDiscipline, type Prisma } from '@prisma/client'



export class CourseWithDisciplinePresenter {
  static toHTTP(courseWithDiscipline: CourseWithDiscipline): Prisma.CourseOnDisciplineUncheckedUpdateInput & Prisma.DisciplineUncheckedUpdateInput {
    return {
      courseId: courseWithDiscipline.courseId.toValue(),
      disciplineId: courseWithDiscipline.disciplineId.toValue(),
      module: courseWithDiscipline.module,
      name: courseWithDiscipline.disciplineName
    }
  }
}