import { 
  Prisma, 
  type Assessment as PrismaAssessment, 
  type Classification as PrismaClassification,
  type CourseOnDiscipline,
} from '@prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts'
import { convertStatusToDomain } from '@/infra/utils/convert-status-by-layer.ts'
import { Classification } from '@/domain/boletim/enterprise/entities/classification.ts'

type PrismaClassificationDetails = PrismaClassification & {
  assessments: PrismaAssessment[]
  courseDisciplines: CourseOnDiscipline[]
  user: Prisma.UserUncheckedUpdateInput
}

type PrismaClassificationResponse = PrismaClassification

export class PrismaClassificationsMapper {
  static toDomain(classificationDetails: PrismaClassificationDetails): Classification {
    const classification = Classification.create({
      courseId: new UniqueEntityId(classificationDetails.courseId),
      studentId: new UniqueEntityId(classificationDetails.studentId),
      poleId: new UniqueEntityId(classificationDetails.poleId),
      assessmentsCount: classificationDetails.assessmentsCount,
      average: Number(classificationDetails.average),
      assessments: classificationDetails.assessments.map(item => {
        const courseDiscipline = classificationDetails.courseDisciplines.find(courseDiscipline => courseDiscipline.disciplineId === item.disciplineId)
        if (!courseDiscipline) throw new Error('Course discipline does not exist')

        return {
          id: item.id,
          courseId: item.courseId,
          disciplineId: item.disciplineId,
          isRecovering: item.isRecovering,
          status: convertStatusToDomain(item.status), 
          module: courseDiscipline.module,
          average: Number(item.average),
          vf: item.vf ? Number(item.vf) : null,
          avi: item.avi ? Number(item.avi) : null,
          avii: item.avii ? Number(item.avii) : null,
          vfe: item.vfe ? Number(item.vfe) : null,
        }
      }),
      concept: classificationDetails.concept,
      status: convertStatusToDomain(classificationDetails.status),
      studentBirthday: classificationDetails.user.birthday ? new Date(classificationDetails.user.birthday.toString()) : undefined,
      behaviorsCount: classificationDetails.behaviorsCount
    }, new UniqueEntityId(classificationDetails.id))

    return classification
  }

  static toPrisma(classification: Classification): PrismaClassificationResponse {
    return {
      id: classification.id.toValue(),
      courseId: classification.courseId.toValue(),
      studentId: classification.studentId.toValue(),
      poleId: classification.poleId.toValue(),
      average: new Prisma.Decimal(classification.average),
      assessmentsCount: classification.assessmentsCount,
      concept: classification.concept,
      status: classification.status,
      behaviorsCount: classification.behaviorsCount
    }
  }
}