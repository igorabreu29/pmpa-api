import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { Pole } from '@/domain/boletim/enterprise/entities/pole.ts';
import { Name } from '@/domain/boletim/enterprise/entities/value-objects/name.ts';
import { Prisma, Pole as PrismaPole } from '@prisma/client';

export class PrismaPolesMapper {
  static toDomain(pole: PrismaPole): Pole {
    const nameOrError = Name.create(pole.name)

    if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

    const poleOrError = Pole.create({
      name: nameOrError.value
    }, new UniqueEntityId(pole.id))
    if (poleOrError.isLeft()) throw new Error(poleOrError.value.message)
    
    return poleOrError.value
  }

  static toPrisma(pole: Pole): Prisma.PoleUncheckedCreateInput {
    return {
      id: pole.id.toValue(),
      name: pole.name.value,
    }
  }
}