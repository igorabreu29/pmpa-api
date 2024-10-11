import type { CoursesDisciplinesRepository, FindManyByCourseIdWithDiscipline } from "@/domain/boletim/app/repositories/courses-disciplines-repository.ts";
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

  async findManyByCourseIdWithDiscipliine({
    courseId,
    search
  }: FindManyByCourseIdWithDiscipline): Promise<CourseWithDiscipline[]> {
    const courseDisciplines = await prisma.courseOnDiscipline.findMany({
      where: {
        courseId,
        discipline: {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        }
      },

      include: {
        discipline: true
      },

      orderBy: {
        discipline: {
          name: 'asc'
        }
      }
    })

    return courseDisciplines.map(courseDiscipline => PrismaCourseWithDisciplineMapper.toDomain(courseDiscipline))
  }

  async create(courseDiscipline: CourseDiscipline): Promise<void> {
    const raw = PrismaCourseDisciplinesMapper.toPrisma(courseDiscipline)
    await prisma.courseOnDiscipline.create({
      data: raw
    })
  }

  async createMany(coursesDisciplines: CourseDiscipline[]): Promise<void> {
    const raw = coursesDisciplines.map(courseDiscipline => PrismaCourseDisciplinesMapper.toPrisma(courseDiscipline))
    await prisma.courseOnDiscipline.createMany({
      data: raw
    })
  }

  async delete(courseDiscipline: CourseDiscipline): Promise<void> {
    const raw = PrismaCourseDisciplinesMapper.toPrisma(courseDiscipline)

    await prisma.assessment.deleteMany({
      where: {
        courseId: raw.courseId,
        disciplineId: raw.disciplineId
      }
    })
  
    await prisma.courseOnDiscipline.delete({
      where: {
        id: raw.id
      }
    })
  }
}