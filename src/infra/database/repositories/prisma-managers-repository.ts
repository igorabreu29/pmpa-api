import { prisma } from "../lib/prisma.ts";
import { ManagersRepository } from "@/domain/boletim/app/repositories/managers-repository.ts";
import { Manager } from "@/domain/boletim/enterprise/entities/manager.ts";
import { PrismaManagersMapper } from "../mappers/prisma-managers-mapper.ts";
import { ManagerDetails } from "@/domain/boletim/enterprise/entities/value-objects/manager-details.ts";
import { PrismaManagerDetailsMapper } from "../mappers/prisma-manager-details-mapper.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";
import type { SearchManyDetails } from "@/domain/boletim/app/repositories/searchs-repository.ts";

export class PrismaManagersRepository implements ManagersRepository {
  async findById(id: string): Promise<Manager | null> {
    const manager = await prisma.user.findUnique({
      where: {
        id,
        role: 'MANAGER'
      },

      select: {
        id: true,
        username: true,
        cpf: true,
        email: true,
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
    if (!manager) return null

    return PrismaManagersMapper.toDomain({
      ...manager,
      profile: manager.profile ?? undefined
    })
  }

  async findByCPF(cpf: string): Promise<Manager | null> {
    const manager = await prisma.user.findUnique({
      where: {
        cpf,
        role: 'MANAGER'
      },

      select: {
        id: true,
        username: true,
        cpf: true,
        email: true,
        civilId: true,
        birthday: true,
        avatarUrl: true,
        password: true,
        createdAt: true,
        isLoginConfirmed: true,
        role: true,
      }
    }) 
    if (!manager) return null

    return PrismaManagersMapper.toDomain({
      ...manager,
      profile: undefined
    })
  }

  async findByEmail(email: string): Promise<Manager | null> {
    const manager = await prisma.user.findUnique({
      where: {
        email,
        role: 'MANAGER'
      },

      select: {
        id: true,
        username: true,
        cpf: true,
        email: true,
        civilId: true,
        birthday: true,
        avatarUrl: true,
        password: true,
        createdAt: true,
        isLoginConfirmed: true,
        role: true,
      }
    }) 
    if (!manager) return null

    return PrismaManagersMapper.toDomain({
      ...manager,
      profile: undefined
    })
  }

  async findDetailsById(id: string): Promise<ManagerDetails | null> {
    const managerDetails = await prisma.user.findUnique({
      where: {
        id,
        role: 'MANAGER'
      },

      select: {
        id: true,
        username: true,
        cpf: true,
        email: true,
        civilId: true,
        birthday: true,
        avatarUrl: true,
        password: true,
        role: true,
        createdAt: true,
        isLoginConfirmed: true,
        profile: {
          select: {
            fatherName: true,
            motherName: true,
            county: true,
            militaryId: true,
            state: true
          }
        },
        usersOnCourses: {
          include: {
            course: true,
            usersOnPoles: {
              include: {
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
      militaryId: managerDetails.profile?.militaryId,
      state: managerDetails.profile?.state,
      county: managerDetails.profile?.county,
      motherName: managerDetails.profile?.motherName,
      fatherName: managerDetails.profile?.fatherName,
      isLoginConfirmed: managerDetails.isLoginConfirmed,
      createdAt: managerDetails.createdAt,
      managerCourses: managerDetails.usersOnCourses.map(userOnCourse => ({
        id: userOnCourse.id,
        courseId: userOnCourse.courseId,
        userId: userOnCourse.userId,
      })),
      managerPoles: managerDetails.usersOnCourses.map(userOnCourse => {
        return {
          id: userOnCourse.usersOnPoles[0].id,
          poleId: userOnCourse.usersOnPoles[0].poleId,
          userOnCourseId: userOnCourse.usersOnPoles[0].userOnCourseId,
        }
      }),
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
          include: {
            course: true,
            usersOnPoles: {
              include: {
                pole: true
              }
            }
          }
        },
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
        isLoginConfirmed: manager.isLoginConfirmed,
        createdAt: manager.createdAt,
        managerCourses: manager.usersOnCourses.map(userOnCourse => ({
          id: userOnCourse.id,
          courseId: userOnCourse.courseId,
          userId: userOnCourse.userId,
        })),
        managerPoles: manager.usersOnCourses.map(userOnCourse => {
          return {
            id: userOnCourse.usersOnPoles[0].id,
            poleId: userOnCourse.usersOnPoles[0].poleId,
            userOnCourseId: userOnCourse.usersOnPoles[0].userOnCourseId,
          }
        }),
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

    DomainEvents.dispatchEventsForAggregate(manager.id)
  }

  async save(manager: Manager): Promise<void> {
    const prismaMapper = PrismaManagersMapper.toPrisma(manager)
    await prisma.user.update({
      where: {
        id: prismaMapper.id,
        role: 'MANAGER'
      },
      data: {
        ...prismaMapper,
        profile: {
          upsert: {
            where: {
              userId: manager.id.toValue()
            },

            create: {
              fatherName: manager.parent?.fatherName,
              motherName: manager.parent?.motherName,
              county: manager.county,
              militaryId: manager.militaryId,
              state: manager.state
            },
            
            update: {
              fatherName: manager.parent?.fatherName,
              motherName: manager.parent?.motherName,
              county: manager.county,
              militaryId: manager.militaryId,
              state: manager.state
            }
          }
        }
      },
    })

    DomainEvents.dispatchEventsForAggregate(manager.id)
  }

  async delete(manager: Manager): Promise<void> {
    const prismaMapper = PrismaManagersMapper.toPrisma(manager)

    await prisma.user.delete({
      where: {
        id: prismaMapper.id,
      },
    })

    DomainEvents.dispatchEventsForAggregate(manager.id)
  }
}