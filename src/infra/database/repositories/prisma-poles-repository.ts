import { PolesRepository } from "@/domain/boletim/app/repositories/poles-repository.ts";
import { Pole } from "@/domain/boletim/enterprise/entities/pole.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaPolesMapper } from "../mappers/prisma-poles-mapper.ts";

export class PrismaPolesRepository implements PolesRepository {
  async findById(id: string): Promise<Pole | null> {
    const pole = await prisma.pole.findUnique({
      where: {
        id
      }
    })
    if (!pole) return null

    return PrismaPolesMapper.toDomain(pole)
  }

  async findByName(name: string): Promise<Pole | null> {
    const pole = await prisma.pole.findFirst({
      where: {
        name
      }
    })
    if (!pole) return null

    return PrismaPolesMapper.toDomain(pole)
  }

  async create(pole: Pole): Promise<void> {
    const prismaMapper = PrismaPolesMapper.toPrisma(pole)
    await prisma.pole.create({
      data: prismaMapper
    })
  }

  async createMany(poles: Pole[]): Promise<void> {
    const prismaMapper = poles.map(pole => PrismaPolesMapper.toPrisma(pole))
    await prisma.pole.createMany({
      data: prismaMapper
    })
  }
}