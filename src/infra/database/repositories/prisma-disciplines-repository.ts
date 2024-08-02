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

  async create(discipline: Discipline): Promise<void> {
    const prismaMapper = PrismaDisciplinesMapper.toPrisma(discipline)
    await prisma.discipline.create({
      data: prismaMapper
    })
  } 

  async createMany(disciplines: Discipline[]): Promise<void> {
    const prismaMapper = disciplines.map(discipline => PrismaDisciplinesMapper.toPrisma(discipline))
    await prisma.discipline.createMany({
      data: prismaMapper
    })
  }
}