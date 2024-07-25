import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { Discipline } from '@/domain/boletim/enterprise/entities/discipline.ts';
import { Prisma, Discipline as PrismaDiscipline } from '@prisma/client';

export class PrismaDisciplinesMapper {
  static toDomain(course: PrismaDiscipline): Discipline {
    const discipline = Discipline.create({
      name: course.name
    }, new UniqueEntityId(course.id))
    
    return discipline
  }

  static toPrisma(discipline: Discipline): Prisma.PoleUncheckedCreateInput {
    return {
      id: discipline.id.toValue(),
      name: discipline.name,
    }
  }
}