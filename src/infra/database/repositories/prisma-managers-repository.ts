import { prisma } from "../lib/prisma.ts";
import { ManagersRepository } from "@/domain/boletim/app/repositories/managers-repository.ts";
import { Manager } from "@/domain/boletim/enterprise/entities/manager.ts";
import { PrismaManagersMapper } from "../mappers/prisma-managers-mapper.ts";
import { ManagerDetails } from "@/domain/boletim/enterprise/entities/value-objects/manager-details.ts";
import { PrismaManagerDetailsMapper } from "../mappers/prisma-manager-details-mapper.ts";
import { SearchManyDetails } from "@/domain/boletim/app/repositories/students-courses-repository.ts";

export class PrismaManagersRepository implements ManagersRepository {
  async findById(id: string): Promise<Manager | null> {
    const manager = await prisma.user.findUnique({
      where: {
        id
      }
    }) 
    if (!manager) return null

    return PrismaManagersMapper.toDomain(manager)
  }

  async findByCPF(cpf: string): Promise<Manager | null> {
    const manager = await prisma.user.findUnique({
      where: {
        cpf
      }
    }) 
    if (!manager) return null

    return PrismaManagersMapper.toDomain(manager)
  }

  async findByEmail(email: string): Promise<Manager | null> {
    const manager = await prisma.user.findUnique({
      where: {
        email
      }
    }) 
    if (!manager) return null

    return PrismaManagersMapper.toDomain(manager)
  }

  async findDetailsById(id: string): Promise<ManagerDetails | null> {
    const managerDetails = await prisma.user.findUnique({
      where: {
        id
      },

      include: {
        usersOnCourses: {
          select: {
            course: true,
            usersOnPoles: {
              select: {
                pole: true
              }
            }
          }
        },
      }
    })

    if (!managerDetails) return null

    const managerDetailsMapper = {
      id: managerDetails.id,
      username: managerDetails.username,
      email: managerDetails.email,
      password: managerDetails.password,
      cpf: managerDetails.cpf,
      civilId: managerDetails.civilId,
      avatarUrl: managerDetails.avatarUrl,
      birthday: managerDetails.birthday,
      assignedAt: managerDetails.createdAt,
      role: managerDetails.role,
      isActive: managerDetails.isActive,
      isLoginConfirmed: managerDetails.isLoginConfirmed,
      createdAt: managerDetails.createdAt,
      courses: managerDetails.usersOnCourses.map(item => {
        return item.course
      }),
      poles: managerDetails.usersOnCourses.map(userOnCourse => {
        return {
          id: userOnCourse.usersOnPoles[0].pole.id,
          name: userOnCourse.usersOnPoles[0].pole.name
        }
      })
    }

    return PrismaManagerDetailsMapper.toDomain(managerDetailsMapper)
  }

  async searchManyDetails({ query, page }: SearchManyDetails): Promise<ManagerDetails[]> {
    const PER_PAGE = 10

    const managers = await prisma.user.findMany({
      where: {
        role: 'MANAGER',
        username: {
          contains: query
        },
      },
      take: page * PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      include: {
        usersOnCourses: {
          select: {
            course: true,
            usersOnPoles: {
              select: {
                pole: true
              }
            }
          },
        }
      }
    })

    const managersMapper = managers.map(manager => {
      return {
        id: manager.id,
        username: manager.username,
        email: manager.email,
        password: manager.password,
        cpf: manager.cpf,
        civilId: manager.civilId,
        avatarUrl: manager.avatarUrl,
        birthday: manager.birthday,
        assignedAt: manager.createdAt,
        role: manager.role,
        isActive: manager.isActive,
        isLoginConfirmed: manager.isLoginConfirmed,
        createdAt: manager.createdAt,
        courses: manager.usersOnCourses.map(item => {
          return item.course
        }),
        poles: manager.usersOnCourses.map(userOnCourse => {
          return {
            id: userOnCourse.usersOnPoles[0].pole.id,
            name: userOnCourse.usersOnPoles[0].pole.name
          }
        })
      }
    })

    return managersMapper.map(PrismaManagerDetailsMapper.toDomain)
  }

  async create(manager: Manager): Promise<void> {
    const prismaMapper = PrismaManagersMapper.toPrisma(manager)
    await prisma.user.create({ data: prismaMapper })
  }

  async createMany(managers: Manager[]): Promise<void> {
    const prismaMapper = managers.map(manager => PrismaManagersMapper.toPrisma(manager))
    await prisma.user.createMany({ data: prismaMapper })
  }

  async save(manager: Manager): Promise<void> {
    const prismaMapper = PrismaManagersMapper.toPrisma(manager)
    await prisma.user.update({
      where: {
        id: prismaMapper.id,
        role: 'MANAGER'
      },
      data: prismaMapper
    })
  }

  async delete(manager: Manager): Promise<void> {
    const prismaMapper = PrismaManagersMapper.toPrisma(manager)

    await prisma.user.delete({
      where: {
        id: prismaMapper.id,
      },
    })
  }
}