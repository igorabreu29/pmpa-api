import { 
  Prisma, 
  type Assessment as PrismaAssessment, 
  type Classification as PrismaClassification,
  type CourseOnDiscipline
} from '@prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'
import { convertStatusToDomain, convertStatusToPrisma } from '@/infra/utils/convert-status-by-layer.ts'
import { Classification } from '@/domain/boletim/enterprise/entities/classification.ts'

type PrismaClassificationDetails = PrismaClassification & {
  assessments: (PrismaAssessment & CourseOnDiscipline)[]
  user: Prisma.UserUncheckedUpdateInput
}

export class PrismaClassificationsMapper {
  static toDomain(classificationDetails: PrismaClassificationDetails): Classification {
    const classification = Classification.create({
      courseId: new UniqueEntityId(classificationDetails.courseId),
      studentId: new UniqueEntityId(classificationDetails.studentId),
      poleId: new UniqueEntityId(classificationDetails.poleId),
      assessmentsCount: classificationDetails.assessmentsCount,
      average: Number(classificationDetails.average),
      behavior: [
        {
          behaviorAverage: classificationDetails.behaviorAverageModule1 ? 
            Number(classificationDetails.behaviorAverageModule1)
            : 0,
          status: classificationDetails.behaviorStatusModule1 || 'approved',
        },
        {
          behaviorAverage: classificationDetails.behaviorAverageModule2 ? 
            Number(classificationDetails.behaviorAverageModule2)
            : 0,
          status: classificationDetails.behaviorStatusModule1 || 'approved',
        },
        {
          behaviorAverage: classificationDetails.behaviorAverageModule3 ? 
            Number(classificationDetails.behaviorAverageModule3)
            : 0,
          status: classificationDetails.behaviorStatusModule1 || 'approved',
        },
      ],
      assessments: classificationDetails.assessments.map(item => {
        return {
          id: item.id,
          courseId: item.courseId,
          disciplineId: item.disciplineId,
          isRecovering: item.isRecovering,
          status: convertStatusToDomain(item.status), 
          module: item.module,
          average: Number(item.average),
          vf: item.vf ? Number(item.vf) : null,
          avi: item.avi ? Number(item.avi) : null,
          avii: item.avii ? Number(item.avii) : null,
          vfe: item.vfe ? Number(item.vfe) : null,
        }
      })
    }, new UniqueEntityId(classificationDetails.id))

    return classification
  }

  static toPrisma(classification: Classification): PrismaClassification {
    return {
    }
  }
}