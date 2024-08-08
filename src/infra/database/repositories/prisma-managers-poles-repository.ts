import { ManagersPolesRepository } from "@/domain/boletim/app/repositories/managers-poles-repository.ts";
import { ManagerPole } from "@/domain/boletim/enterprise/entities/manager-pole.ts";
import { PrismaManagersPolesMapper } from "../mappers/prisma-managers-poles-mapper.ts";
import { prisma } from "../lib/prisma.ts";

export class PrismaManagersPolesRepository implements ManagersPolesRepository {
  async findByManagerId({ managerId }: { managerId: string; }): Promise<ManagerPole | null> {
    const managerPole = await prisma.userCourseOnPole.findFirst({
      where: {
        userOnCourseId: managerId
      }
    })
    if (!managerPole) return null

    return PrismaManagersPolesMapper.toDomain(managerPole)
  }

  async findByManagerIdAndPoleId({ managerId, poleId }: { managerId: string; poleId: string; }): Promise<ManagerPole | null> {
    const managerPole = await prisma.userCourseOnPole.findFirst({
      where: {
        userOnCourseId: managerId,
        poleId: poleId
      }
    })
    if (!managerPole) return null

    return PrismaManagersPolesMapper.toDomain(managerPole)
  }

  async create(managerPole: ManagerPole): Promise<void> {
    const prismaMapper = PrismaManagersPolesMapper.toPrisma(managerPole)
    await prisma.userCourseOnPole.create({
      data: prismaMapper
    })
  }

  async delete(managerPole: ManagerPole): Promise<void> {
    const prismaMapper = PrismaManagersPolesMapper.toPrisma(managerPole)
    await prisma.userCourseOnPole.delete({
      where: {
        id: prismaMapper.id
      }
    })
  }
}