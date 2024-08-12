import { Discipline } from "@/domain/boletim/enterprise/entities/discipline.ts";
import { Discipline as PrismaDiscipline } from '@prisma/client'

export class DisciplinePresenter {
  static toHTTP(discipline: Discipline): PrismaDiscipline {
    return {
      id: discipline.id.toValue(),
      name: discipline.name.value
    }
  }
}