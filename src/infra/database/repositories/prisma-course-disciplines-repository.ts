import type { CoursesDisciplinesRepository } from "@/domain/boletim/app/repositories/courses-disciplines-repository.ts";
import type { CourseDiscipline } from "@/domain/boletim/enterprise/entities/course-discipline.ts";
import type { CourseWithDiscipline } from "@/domain/boletim/enterprise/entities/value-objects/course-with-discipline.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaCourseDisciplinesMapper } from "../mappers/prisma-course-disciplines-repository-mapper.ts";
import { PrismaCourseWithDisciplineMapper } from "../mappers/prisma-course-with-discipline-mapper.ts";

export class PrismaCourseDisciplinesRepository implements CoursesDisciplinesRepository {
  async findByCourseAndDisciplineId({ 
    courseId, 
    disciplineId 
  }: { 
    courseId: string; 
    disciplineId: string; 
  }): Promise<CourseDiscipline | null> {
    const courseDiscipline = await prisma.courseOnDiscipline.findFirst({
      where: {
        courseId,
        disciplineId
      }
    })
    if (!courseDiscipline) return null

    return PrismaCourseDisciplinesMapper.toDomain(courseDiscipline)
  }

  async findByCourseIdAndDisciplineIdWithDiscipline({ 
    courseId, 
    disciplineId 
  }: { 
    courseId: string; 
    disciplineId: string; 
  }): Promise<CourseWithDiscipline | null> {
    const courseDiscipline = await prisma.courseOnDiscipline.findFirst({
      where: {
        courseId,
        disciplineId
      },
      
      include: {
        discipline: true
      }
    })
    if (!courseDiscipline) return null

    return PrismaCourseWithDisciplineMapper.toDomain(courseDiscipline)
  }

  async create(courseDiscipline: CourseDiscipline): Promise<void> {
    const prismaMapper = PrismaCourseDisciplinesMapper.toPrisma(courseDiscipline)
    await prisma.courseOnDiscipline.create({
      data: prismaMapper
    })
  }

  async createMany(coursesDisciplines: CourseDiscipline[]): Promise<void> {
    const prismaMapper = coursesDisciplines.map(courseDiscipline => PrismaCourseDisciplinesMapper.toPrisma(courseDiscipline))
    await prisma.courseOnDiscipline.createMany({
      data: prismaMapper
    })
  }
}