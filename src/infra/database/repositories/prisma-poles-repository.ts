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

  async findMany(page: number): Promise<{ poles: Pole[]; pages: number; totalItems: number; }> {
    const PER_PAGE = 10

    const poles = await prisma.pole.findMany({
      skip: (page - 1) * PER_PAGE,
      take: page * PER_PAGE,
      orderBy: {
        name: 'asc'
      }
    })

    const polesCount = await prisma.pole.count()
    const pages = Math.ceil(polesCount / PER_PAGE)

    return {
      poles: poles.map(pole => PrismaPolesMapper.toDomain(pole)),
      pages,
      totalItems: polesCount
    }
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