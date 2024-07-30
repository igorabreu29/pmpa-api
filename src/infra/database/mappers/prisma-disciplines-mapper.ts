import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { Discipline } from '@/domain/boletim/enterprise/entities/discipline.ts';
import { Name } from '@/domain/boletim/enterprise/entities/value-objects/name.ts';
import { Prisma, Discipline as PrismaDiscipline } from '@prisma/client';

export class PrismaDisciplinesMapper {
  static toDomain(discipline: PrismaDiscipline): Discipline {
    const nameOrError = Name.create(discipline.name)
    if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

    const disciplineOrError = Discipline.create({
      name: nameOrError.value
    }, new UniqueEntityId(discipline.id))
    if (disciplineOrError.isLeft()) throw new Error(disciplineOrError.value.message)
    
    return disciplineOrError.value
  }

  static toPrisma(discipline: Discipline): Prisma.PoleUncheckedCreateInput {
    return {
      id: discipline.id.toValue(),
      name: discipline.name.value,
    }
  }
}