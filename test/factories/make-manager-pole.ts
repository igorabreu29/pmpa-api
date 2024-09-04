import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ManagerPole, ManagerPoleProps } from "@/domain/boletim/enterprise/entities/manager-pole.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { PrismaManagersPolesMapper } from "@/infra/database/mappers/prisma-managers-poles-mapper.ts";

export function makeManagerPole(
  override: Partial<ManagerPole> = {},
  id?: UniqueEntityId
) {
  return ManagerPole.create({
    poleId: new UniqueEntityId(),
    managerId: new UniqueEntityId(),
    ...override
  }, id)
}

export async function makePrismaManagerPole(
  data: Partial<ManagerPoleProps> = {}
) {
  const managerPole = makeManagerPole(data)

  await prisma.userCourseOnPole.create({
    data: PrismaManagersPolesMapper.toPrisma(managerPole)
  })

  return managerPole
}