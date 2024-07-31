import { ManagersCoursesRepository } from "@/domain/boletim/app/repositories/managers-courses-repository.ts";
import { ManagerCourse } from "@/domain/boletim/enterprise/entities/manager-course.ts";
import { ManagerCourseDetails, ManagerWithCourseAndPole } from "@/domain/boletim/enterprise/entities/value-objects/manager-with-course-and-pole.ts";
import { ManagerWithCourse } from "@/domain/boletim/enterprise/entities/value-objects/manager-with-course.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaManagersCoursesMapper } from "../mappers/prisma-managers-courses-mapper.ts";
import { PrismaManagerCourseDetailsMapper } from "../mappers/prisma-manager-with-course-and-pole.ts";

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

  async findByManagerAndCourseIdWithPole({ managerId, courseId }: { managerId: string; courseId: string; }): Promise<ManagerCourseDetails | null> {
    const managerCourse = await prisma.userOnCourse.findFirst({
      where: {
        userId: managerId,
        courseId,
      },

      include: {
        usersOnPoles: {
          select: {
            poles: true
          }
        }
      }
    })
    if (!managerCourse) return null

    const prismaManagerCourseMapper = {
      ...managerCourse,
      pole: managerCourse.usersOnPoles[0].poles
    }

    return PrismaManagerCourseDetailsMapper.toDomain(prismaManagerCourseMapper)
  }

  async findManyByCourseIdWithCourseAndPole({ courseId, page, perPage }: { courseId: string; page: number; perPage: number; }): Promise<{ managersCourse: ManagerWithCourseAndPole[]; pages: number; totalItems: number; }> {
      
  }

  async findManyByManagerIdWithCourse({ managerId, page, perPage }: { managerId: string; page: number; perPage: number; }): Promise<{ managerCourses: ManagerWithCourse[]; pages: number; totalItems: number; }> {
      
  }

  async create(managerCourse: ManagerCourse): Promise<void> {
      
  }
}