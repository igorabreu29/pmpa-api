import { ManagersCoursesRepository } from "@/domain/boletim/app/repositories/managers-courses-repository.ts";
import { ManagerCourse } from "@/domain/boletim/enterprise/entities/manager-course.ts";
import { ManagerCourseDetails } from "@/domain/boletim/enterprise/entities/value-objects/manager-course-details.ts";
import { ManagerWithCourse } from "@/domain/boletim/enterprise/entities/value-objects/manager-with-course.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaManagersCoursesMapper } from "../mappers/prisma-managers-courses-mapper.ts";
import { PrismaManagerCourseDetailsMapper } from "../mappers/prisma-manager-course-details.ts";
import { PrismaManagerWithCourseMapper } from "../mappers/prisma-manager-with-course-mapper.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";

export class PrismaManagersCoursesRepository implements ManagersCoursesRepository {
  async findByCourseId({ courseId }: { courseId: string; }): Promise<ManagerCourse | null> {
    const managerCourse = await prisma.userOnCourse.findFirst({
      where: {
        courseId
      }
    })
    if (!managerCourse) return null

    return PrismaManagersCoursesMapper.toDomain(managerCourse)
  }

  async findByManagerIdAndCourseId({ managerId, courseId }: { managerId: string; courseId: string; }): Promise<ManagerCourse | null> {
    const managerCourse = await prisma.userOnCourse.findFirst({
      where: {
        userId: managerId,
        courseId,
      }
    })
    if (!managerCourse) return null

    return PrismaManagersCoursesMapper.toDomain(managerCourse)
  }

  async findDetailsByManagerAndCourseId({ managerId, courseId }: { managerId: string; courseId: string; }): Promise<ManagerCourseDetails | null> {
    const managerCourse = await prisma.userOnCourse.findFirst({
      where: {
        userId: managerId,
        courseId,
      },

      include: {
        course: true,
        user: true,
        usersOnPoles: {
          select: {
            pole: true
          }
        }
      }
    })
    if (!managerCourse) return null

    const prismaManagerCourseMapper = {
      ...managerCourse.user,
      course: managerCourse.course,
      pole: managerCourse.usersOnPoles[0].pole
    }

    return PrismaManagerCourseDetailsMapper.toDomain(prismaManagerCourseMapper)
  }

  async findManyDetailsByCourseId({ 
    courseId, 
    page, 
    cpf,
    isEnabled,
    username,
    perPage 
  }: { 
    courseId: string; 
    page?: number; 
    cpf?: string
    isEnabled?: boolean
    username?: string
    perPage?: number; 
  }): Promise<{ 
    managersCourse: ManagerCourseDetails[]; 
    pages?: number; 
    totalItems?: number; 
  }> {
    const filterPayload: Record<string, object> = {
      where: {
        courseId,
        user: {
          role: 'MANAGER',
          username: {
            contains: username,
            mode: 'insensitive'
          },
          cpf: {
            contains: cpf
          },
        },
      }
    }

    if (isEnabled !== undefined) {
      filterPayload.where = {
        ...filterPayload.where,
        isActive: isEnabled
      }
    }

    const managersCourse = await prisma.userOnCourse.findMany({
      where: filterPayload.where,

      include: {
        user: {
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
            isActive: true,
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
        },
        course: true,
        usersOnPoles: {
          include: {
            pole: true
          }
        }
      },

      skip: page && perPage ? (page - 1) * perPage : undefined,
      take: perPage
    })

    const managersCourseMapper = managersCourse.map(managerCourse => {
      const poleExist = managerCourse.usersOnPoles.find(item => item.userOnCourseId === managerCourse.id)
      if (!poleExist) throw new Error('Polo não encontrado!')

      return {
        ...managerCourse.user,
        profile: managerCourse.user.profile ?? undefined,
        course: managerCourse.course,
        pole: poleExist.pole
      }
    })

    const managersCourseCount = await prisma.userOnCourse.count({
      where: filterPayload.where
    })
    const pages = perPage && Math.ceil(managersCourseCount / perPage)

    return {
      managersCourse: managersCourseMapper.map(managerCourse => PrismaManagerCourseDetailsMapper.toDomain(managerCourse)),
      pages,
      totalItems: managersCourseCount
    }
  }

  async findManyByManagerIdWithCourse({ managerId, page, perPage }: { managerId: string; page: number; perPage: number; }): Promise<{ managerCourses: ManagerWithCourse[]; pages: number; totalItems: number; }> {
    const managerCourses = await prisma.userOnCourse.findMany({
      where: {
        userId: managerId
      },

      skip: (page - 1) * perPage,
      take: perPage,

      orderBy: {
        createdAt: 'desc',
      },

      include: {
        course: true,
        user: true,
      }
    })

    const managerCoursesMapper = managerCourses.map(managerCourses => {
      return {
        ...managerCourses.user,
        course: managerCourses.course
      }
    })

    const managerCoursesCount = await prisma.userOnCourse.count({
      where: {
        userId: managerId,
      },
    })
    const pages = Math.ceil(managerCoursesCount / perPage)

    return {
      managerCourses: managerCoursesMapper.map(managerCourse => PrismaManagerWithCourseMapper.toDomain(managerCourse)),
      pages,
      totalItems: managerCoursesCount
    }
  }

  async create(managerCourse: ManagerCourse): Promise<void> {
    const prismaMapper = PrismaManagersCoursesMapper.toPrisma(managerCourse)
    await prisma.userOnCourse.create({
      data: prismaMapper
    })
  }

  async updateStatus(managerCourse: ManagerCourse): Promise<void> {
    const prismaMapper = PrismaManagersCoursesMapper.toPrisma(managerCourse)
    await prisma.userOnCourse.update({
      where: {
        id: prismaMapper.id
      },
      data: {
        isActive: prismaMapper.isActive
      }
    })

    DomainEvents.dispatchEventsForAggregate(managerCourse.id)
  }

  async delete(managerCourse: ManagerCourse): Promise<void> {
    const prismaMapper = PrismaManagersCoursesMapper.toPrisma(managerCourse)
    await prisma.userOnCourse.delete({
      where: {
        id: prismaMapper.id
      }
    })
  }
}