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
      },

      select: {
        id: true,
        username: true,
        cpf: true,
        email: true,
        isActive: true,
        civilId: true,
        birthday: true,
        avatarUrl: true,
        password: true,
        createdAt: true,
        isLoginConfirmed: true,
        role: true,
        profile: {
          select: {
            userId: true,
            fatherName: true,
            motherName: true,
            county: true,
            militaryId: true,
            state: true
          }
        },
      }
    })
    if (!developer) return null
    
    return PrismaDevelopersMapper.toDomain({
      ...developer,
      profile: developer.profile ?? undefined
    })
  }

  async findByCPF(cpf: string): Promise<Developer | null> {
    const developer = await prisma.user.findUnique({
      where: {
        cpf,
        role: 'DEV'
      },

      select: {
        id: true,
        username: true,
        cpf: true,
        email: true,
        civilId: true,
        isActive: true,
        birthday: true,
        avatarUrl: true,
        password: true,
        createdAt: true,
        isLoginConfirmed: true,
        role: true,
      }
    })
    if (!developer) return null
    
    return PrismaDevelopersMapper.toDomain(developer)
  }

  async findByEmail(email: string): Promise<Developer | null> {
    const developer = await prisma.user.findUnique({
      where: {
        email,
        role: 'DEV'
      },

      select: {
        id: true,
        username: true,
        cpf: true,
        email: true,
        civilId: true,
        birthday: true,
        isActive: true,
        avatarUrl: true,
        password: true,
        createdAt: true,
        isLoginConfirmed: true,
        role: true,
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
      data: {
        ...prismaMapper,
        profile: {
          upsert: {
            where: {
              userId: developer.id.toValue()
            },

            create: {
              fatherName: developer.parent?.fatherName,
              motherName: developer.parent?.motherName,
              county: developer.county,
              militaryId: developer.militaryId,
              state: developer.state
            },
            
            update: {
              fatherName: developer.parent?.fatherName,
              motherName: developer.parent?.motherName,
              county: developer.county,
              militaryId: developer.militaryId,
              state: developer.state
            }
          }
        }
      }
    })
  }
}