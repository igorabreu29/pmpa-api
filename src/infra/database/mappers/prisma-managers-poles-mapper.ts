import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { ManagerPole } from '@/domain/boletim/enterprise/entities/manager-pole.ts';
import { Prisma, UserCourseOnPole } from '@prisma/client'

export class PrismaManagersPolesMapper {
  static toDomain(managerPole: UserCourseOnPole): ManagerPole {
    return ManagerPole.create({
      poleId: new UniqueEntityId(managerPole.poleId),
      managerId: new UniqueEntityId(managerPole.id),
      createdAt: managerPole.createdAt
    }, new UniqueEntityId(managerPole.id))
  }

  static toPrisma(managerPole: ManagerPole): Prisma.UserCourseOnPoleUncheckedCreateInput {
    return {
      id: managerPole.id.toValue(),
      poleId: managerPole.poleId.toValue(),
      userOnCourseId: managerPole.managerId.toValue(),
      createdAt: managerPole.createdAt
    }
  }
}