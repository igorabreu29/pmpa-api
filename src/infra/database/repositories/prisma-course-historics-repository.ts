import type { CourseHistoricRepository } from "@/domain/boletim/app/repositories/course-historic-repository.ts";
import type { CourseHistoric } from "@/domain/boletim/enterprise/entities/course-historic.ts";
import { PrismaCourseHistoricsMapper } from "../mappers/prisma-course-historics-mapper.ts";
import { prisma } from "../lib/prisma.ts";

export class PrismaCourseHistoricsRepository implements CourseHistoricRepository {
  async findById(id: string): Promise<CourseHistoric | null> {
    const courseHistoric = await prisma.courseHistoric.findFirst({
      where: {
        id
      }
    })
    if (!courseHistoric) return null

    return PrismaCourseHistoricsMapper.toDomain(courseHistoric)
  }

  async findByCourseId(courseId: string): Promise<CourseHistoric | null> {
    const courseHistoric = await prisma.courseHistoric.findFirst({
      where: {
        courseId
      }
    })
    if (!courseHistoric) return null

    return PrismaCourseHistoricsMapper.toDomain(courseHistoric)
  }

  async create(courseHistoric: CourseHistoric): Promise<void> {
    const raw = PrismaCourseHistoricsMapper.toPrisma(courseHistoric)
    await prisma.courseHistoric.create({
      data: raw
    })
  }

  async delete(courseHistoric: CourseHistoric): Promise<void> {
    const raw = PrismaCourseHistoricsMapper.toPrisma(courseHistoric)
    await prisma.courseHistoric.delete({
      where: {
        id: raw.id
      }
    })
  }
}