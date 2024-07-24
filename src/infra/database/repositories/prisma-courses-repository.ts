import { CoursesRepository } from "@/domain/boletim/app/repositories/courses-repository.ts";
import { Course } from "@/domain/boletim/enterprise/entities/course.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaCoursesMapper } from "../mappers/prisma-courses-mapper.ts";

export class PrismaCoursesRepository implements CoursesRepository {
  async findById(id: string): Promise<Course | null> {
    const course = await prisma.course.findUnique({
      where: {
        id
      }
    })
    if (!course) return null

    return PrismaCoursesMapper.toDomain(course)
  }

  async findByName(name: string): Promise<Course | null> {
    const course = await prisma.course.findFirst({
      where: {
        name
      }
    })
    if (!course) return null

    return PrismaCoursesMapper.toDomain(course)
  }

  async create(course: Course): Promise<void> {
    const prismaMapper = PrismaCoursesMapper.toPrisma(course)
    await prisma.course.create({
      data: prismaMapper
    })
  }
}