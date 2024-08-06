import { DevelopersRepository } from "@/domain/boletim/app/repositories/developers-repository.ts";
import { Developer } from "@/domain/boletim/enterprise/entities/developer.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaDevelopersMapper } from "../mappers/prisma-developers-mapper.ts";

export class PrismaDevelopersRepository implements DevelopersRepository {
  async findById(id: string): Promise<Developer | null> {
    const developer = await prisma.user.findUnique({
      where: {
        role: 'DEV',
        id,
      }
    })
    if (!developer) return null
    
    return PrismaDevelopersMapper.toDomain(developer)
  }

  async findByCPF(cpf: string): Promise<Developer | null> {
    const developer = await prisma.user.findUnique({
      where: {
        role: 'DEV',
        cpf,
      }
    })
    if (!developer) return null
    
    return PrismaDevelopersMapper.toDomain(developer)
  }

  async findByEmail(email: string): Promise<Developer | null> {
    const developer = await prisma.user.findUnique({
      where: {
        role: 'DEV',
        email,
      }
    })
    if (!developer) return null
    
    return PrismaDevelopersMapper.toDomain(developer)
  }

  async create(developer: Developer): Promise<void> {
    const prismaMapper = PrismaDevelopersMapper.toPrisma(developer)
    await prisma.user.create({
      data: prismaMapper
    })
  }

  async save(developer: Developer): Promise<void> {
    const prismaMapper = PrismaDevelopersMapper.toPrisma(developer)
    await prisma.user.update({
      where: {
        id: prismaMapper.id,
        role: 'DEV'
      },
      data: prismaMapper
    })
  }
}