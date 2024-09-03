import { Assessment } from "@/domain/boletim/enterprise/entities/assessment.ts";
import { Prisma } from '@prisma/client'

export class AssessmentPresenter {
  static toHTTP(assessment: Assessment): Prisma.AssessmentUncheckedCreateInput {
    return {
      id: assessment.id.toValue(),
      courseId: assessment.courseId.toValue(),
      disciplineId: assessment.disciplineId.toValue(),
      studentId: assessment.studentId.toValue(),
      vf: assessment.vf,
      avi: assessment.avi,
      avii: assessment.avii,
      vfe: assessment.vfe,
    }
  }
}