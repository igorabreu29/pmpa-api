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

  async findMany(page: number): Promise<{ courses: Course[]; pages: number; totalItems: number; }> {
    const PER_PAGE = 10

    const courses = await prisma.course.findMany({
      skip: (page - 1) * PER_PAGE,
      take: page * PER_PAGE,

      orderBy: {
        startAt: 'asc'
      }
    })

    const coursesCount = await prisma.course.count()
    const pages = Math.ceil(coursesCount / PER_PAGE)

    return {
      courses: courses.map(course => PrismaCoursesMapper.toDomain(course)),
      pages,
      totalItems: coursesCount
    }
  }

  async create(course: Course): Promise<void> {
    const raw = PrismaCoursesMapper.toPrisma(course)
    await prisma.course.create({
      data: raw
    })
  }

  async save(course: Course): Promise<void> {
    const raw = PrismaCoursesMapper.toPrisma(course)
    await prisma.course.update({
      where: {
        id: raw.id
      },
      
      data: raw
    })
  }

  async delete(course: Course): Promise<void> {
    const raw = PrismaCoursesMapper.toPrisma(course)
    await prisma.course.delete({
      where: {
        id: raw.id
      },
    })
  }
}