import { AssessmentsRepository, StudentAssessmentsByCourse, StudentAssessmentsByStudentAndDisciplineAndCourseId } from "@/domain/boletim/app/repositories/assessments-repository.ts";
import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaAssessmentsMapper } from "../mappers/prisma-assessments-mapper.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";

export class PrismaAssessmentsRepository implements AssessmentsRepository {
  async findById({ id }: { id: string; }): Promise<Assessment | null> {
    const assessment = await prisma.assessment.findUnique({
      where: {
        id
      }
    }) 
    if (!assessment) return null

    return PrismaAssessmentsMapper.toDomain(assessment)
  }

  async findByStudentIdAndCourseId({ studentId, courseId }: StudentAssessmentsByCourse): Promise<Assessment | null> {
    const assessment = await prisma.assessment.findFirst({
      where: {
        studentId,
        courseId
      }
    }) 
    if (!assessment) return null

    return PrismaAssessmentsMapper.toDomain(assessment)
  }

  async findByStudentAndDisciplineAndCourseId({ courseId, disciplineId, studentId }: StudentAssessmentsByStudentAndDisciplineAndCourseId): Promise<Assessment | null> {
    const assessment = await prisma.assessment.findFirst({
      where: {
        studentId,
        disciplineId,
        courseId
      }
    }) 
    if (!assessment) return null

    return PrismaAssessmentsMapper.toDomain(assessment)
  }

  async findManyByStudentIdAndCourseId({ studentId, courseId }: StudentAssessmentsByCourse): Promise<Assessment[]> {
    const assessments = await prisma.assessment.findMany({
      where: {
        studentId,
        courseId
      }
    }) 

    return assessments.map(assessment => PrismaAssessmentsMapper.toDomain(assessment))
  }

  async create(assessment: Assessment): Promise<void> {
    const prismaMapper = PrismaAssessmentsMapper.toPrisma(assessment)
    await prisma.assessment.create({
      data: prismaMapper
    })

    DomainEvents.dispatchEventsForAggregate(assessment.id)
  }

  async createMany(assessments: Assessment[]): Promise<void> {
    const prismaMapper = assessments.map(assessment => PrismaAssessmentsMapper.toPrisma(assessment))
    await prisma.assessment.createMany({
      data: prismaMapper
    })
  }

  async update(assessment: Assessment): Promise<void> {
    const prismaMapper = PrismaAssessmentsMapper.toPrisma(assessment)
    await prisma.assessment.update({
      where: {
        id: prismaMapper.id
      },
      data: prismaMapper
    })

    DomainEvents.dispatchEventsForAggregate(assessment.id)
  }

  async delete(assessment: Assessment): Promise<void> {
    const prismaMapper = PrismaAssessmentsMapper.toPrisma(assessment)
    await prisma.assessment.delete({
      where: {
        id: prismaMapper.id
      },
    })

    DomainEvents.dispatchEventsForAggregate(assessment.id)
  }
}