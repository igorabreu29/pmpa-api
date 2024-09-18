import type { DisciplinesRepository } from "@/domain/boletim/app/repositories/disciplines-repository.ts";
import type { Discipline } from "@/domain/boletim/enterprise/entities/discipline.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaDisciplinesMapper } from "../mappers/prisma-disciplines-mapper.ts";

export class PrismaDisciplinesRepository implements DisciplinesRepository {
  async findById(id: string): Promise<Discipline | null> {
    const discipline = await prisma.discipline.findUnique({
      where: {
        id
      }
    })
    if (!discipline) return null

    return PrismaDisciplinesMapper.toDomain(discipline)
  }

  async findByName(name: string): Promise<Discipline | null> {
    const discipline = await prisma.discipline.findFirst({
      where: {
        name
      }
    })
    if (!discipline) return null

    return PrismaDisciplinesMapper.toDomain(discipline)
  }

  async findMany(page: number): Promise<{ disciplines: Discipline[]; pages: number; totalItems: number; }> {
    const PER_PAGE = 10

    const disciplines = await prisma.discipline.findMany({
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,

      orderBy: {
        name: 'asc'
      }
    })

    const disciplinesCount = await prisma.discipline.count()
    const pages = Math.ceil(disciplinesCount / PER_PAGE)

    return {
      disciplines: disciplines.map(discipline => PrismaDisciplinesMapper.toDomain(discipline)),
      pages,
      totalItems: disciplinesCount
    }
  }

  async create(discipline: Discipline): Promise<void> {
    const raw = PrismaDisciplinesMapper.toPrisma(discipline)
    await prisma.discipline.create({
      data: raw
    })
  } 

  async createMany(disciplines: Discipline[]): Promise<void> {
    const raw = disciplines.map(discipline => PrismaDisciplinesMapper.toPrisma(discipline))
    await prisma.discipline.createMany({
      data: raw
    })
  }

  async save(discipline: Discipline): Promise<void> {
    const raw = PrismaDisciplinesMapper.toPrisma(discipline)
    await prisma.discipline.update({
      where: {
        id: raw.id
      },

      data: raw
    })
  }

  async delete(discipline: Discipline): Promise<void> {
    const raw = PrismaDisciplinesMapper.toPrisma(discipline)
    await prisma.discipline.delete({
      where: {
        id: raw.id
      },
    })
  }
}