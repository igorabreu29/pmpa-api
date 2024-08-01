import { Prisma, Assessment as PrismaAssessment } from '@prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'
import { Assessment } from '@/domain/boletim/enterprise/entities/assessment.ts'

export class PrismaAssessmentsMapper {
  static toDomain(assessment: PrismaAssessment): Assessment {
    const assessmentOrError = Assessment.create({
      courseId: new UniqueEntityId(assessment.id),
      studentId: new UniqueEntityId(assessment.studentId),
      disciplineId: new UniqueEntityId(assessment.disciplineId),
      vf: Number(assessment.vf),
      avi: assessment.avi ? Number(assessment.avi) : null,
      avii: assessment.avii ? Number(assessment.avii) : null,
      vfe: assessment.vfe ? Number(assessment.vfe) : null
    })
    if (assessmentOrError.isLeft()) throw new Error(assessmentOrError.value.message)

    return assessmentOrError.value
  }

  static toPrisma(assessment: Assessment): Prisma.AssessmentUncheckedCreateInput {
    return {
      id: assessment.id.toValue(),
      courseId: assessment.courseId.toValue(),
      studentId: assessment.studentId.toValue(),
      disciplineId: assessment.disciplineId.toValue(),
      vf: assessment.vf,
      avi: assessment.avi,
      avii: assessment.avii,
      vfe: assessment.vfe
    }
  }
}