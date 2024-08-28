import { AdministratorsRepository, SearchAdministratorsDetails, type FindManyProps } from "@/domain/boletim/app/repositories/administrators-repository.ts";
import { Administrator } from "@/domain/boletim/enterprise/entities/administrator.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaAdministratorsMapper } from "../mappers/prisma-administrators-mapper.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";

export class PrismaAdministratorsRepository implements AdministratorsRepository {
  async findById(id: string): Promise<Administrator | null> {
    const administrator = await prisma.user.findUnique({
      where: {
        id, 
        role: 'ADMIN'
      }
    })
    if (!administrator) return null

    return PrismaAdministratorsMapper.toDomain(administrator)
  }

  async findByCPF(cpf: string): Promise<Administrator | null> {
    const administrator = await prisma.user.findUnique({
      where: {
        cpf, 
      }
    })
    if (!administrator) return null

    return PrismaAdministratorsMapper.toDomain(administrator)
  }

  async findByEmail(email: string): Promise<Administrator | null> {
    const administrator = await prisma.user.findUnique({
      where: {
        email, 
      }
    })
    if (!administrator) return null

    return PrismaAdministratorsMapper.toDomain(administrator)
  }

  async findMany({ 
    page, 
    cpf, 
    username 
  }: FindManyProps): Promise<{
     administrators: Administrator[]; 
     pages: number; 
     totalItems: number; 
    }> {
    const PER_PAGE = 10

    const administrators = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        cpf: {
          contains: cpf
        },
        username: {
          contains: username
        },
      },

      select: {
        id: true,
        username: true,
        cpf: true,
        email: true,
        birthday: true,
        civilId: true,
        password: true
      },

      orderBy: {
        username: 'desc',
      },

      skip: (page - 1) * PER_PAGE,
      take: page * PER_PAGE
    })

    const administratorsCount = await prisma.user.count({
      where: {
        role: 'ADMIN',
        cpf: {
          contains: cpf
        },
        username: {
          contains: username
        },
      },
    })
    
    const pages = Math.ceil(administratorsCount / PER_PAGE)

    return {
      administrators: administrators.map(PrismaAdministratorsMapper.toDomain),
      pages,
      totalItems: administratorsCount
    }
  }

  async searchManyDetails({ query, page }: SearchAdministratorsDetails): Promise<Administrator[]> {
    const administrators = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        username: {
          contains: query
        }
      }
    })

    return administrators.map(administrator => PrismaAdministratorsMapper.toDomain(administrator))
  }

  async create(admin: Administrator): Promise<void> {
    const prismaMapper = PrismaAdministratorsMapper.toPrisma(admin)
    await prisma.user.create({
      data: prismaMapper
    })

    DomainEvents.dispatchEventsForAggregate(admin.id)
  }

  async save(admin: Administrator): Promise<void> {
    const prismaMapper = PrismaAdministratorsMapper.toPrisma(admin)
    await prisma.user.update({
      where: {
        id: prismaMapper.id,
        role: 'ADMIN'
      },
      data: prismaMapper
    })

    DomainEvents.dispatchEventsForAggregate(admin.id)
  }

  async delete(admin: Administrator): Promise<void> {
    const prismaMapper = PrismaAdministratorsMapper.toPrisma(admin)
    await prisma.user.delete({
      where: {
        id: prismaMapper.id
      },
    })
    
    DomainEvents.dispatchEventsForAggregate(admin.id)
  }
}