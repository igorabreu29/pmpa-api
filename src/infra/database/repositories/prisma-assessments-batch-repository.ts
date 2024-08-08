import type { AssessmentsBatchRepository } from "@/domain/boletim/app/repositories/assessments-batch-repository.ts";
import type { AssessmentBatch } from "@/domain/boletim/enterprise/entities/assessment-batch.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaAssessmentsMapper } from "../mappers/prisma-assessments-mapper.ts";

export class PrismaAssessmentsBathcRepository implements AssessmentsBatchRepository {
  async create(assessmentBatch: AssessmentBatch): Promise<void> {
    const prismaMapper = assessmentBatch.assessments.map(assessment => PrismaAssessmentsMapper.toPrisma(assessment))
      
    await prisma.assessment.createMany({
      data: prismaMapper
    })
  }

  async save(assessmentBatch: AssessmentBatch): Promise<void> {
    const prismaMapper = assessmentBatch.assessments.map(assessment => PrismaAssessmentsMapper.toPrisma(assessment))
    
    await Promise.all(prismaMapper.map(item => {
      prisma.assessment.update({
        where: {
          id: item.id
        },

        data: item
      })
    }))
  }
}