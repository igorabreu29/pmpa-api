import type { CoursesPoleRepository } from "@/domain/boletim/app/repositories/courses-poles-repository.ts";
import type { CoursePole } from "@/domain/boletim/enterprise/entities/course-pole.ts";
import type { Pole } from "@/domain/boletim/enterprise/entities/pole.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaCoursesPolesMapper } from "../mappers/prisma-courses-poles-mapper.ts";
import { PrismaPolesMapper } from "../mappers/prisma-poles-mapper.ts";

export class PrismaCoursePolesRepository implements CoursesPoleRepository {
  async findByCourseIdAndPoleId({ courseId, poleId }: { courseId: string; poleId: string; }): Promise<CoursePole | null> {
    const coursePole = await prisma.courseOnPole.findFirst({
      where: {
        courseId,
        poleId
      }
    })
    if (!coursePole) return null
    
    return PrismaCoursesPolesMapper.toDomain(coursePole)
  }

  async findManyByCourseId({ courseId }: { courseId: string; }): Promise<Pole[]> {
    const coursePoles = await prisma.courseOnPole.findMany({
      where: {
        courseId
      },

      include: {
        pole: true
      }
    })
    
    return coursePoles.map(coursePole => PrismaPolesMapper.toDomain({
      id: coursePole.pole.id,
      name: coursePole.pole.name
    }))
  }

  async create(coursePole: CoursePole): Promise<void> {
    const raw = PrismaCoursesPolesMapper.toPrisma(coursePole)
    await prisma.courseOnPole.create({
      data: raw
    })
  }

  async createMany(coursesPoles: CoursePole[]): Promise<void> {
    const raw = coursesPoles.map(coursePole => PrismaCoursesPolesMapper.toPrisma(coursePole))
    await prisma.courseOnPole.createMany({
      data: raw
    })
  }

  async delete(coursePole: CoursePole): Promise<void> {
    const raw = PrismaCoursesPolesMapper.toPrisma(coursePole)
    await prisma.courseOnPole.delete({
      where: {
        id: raw.id
      }
    })
  }
}