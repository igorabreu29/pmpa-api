import { Classification } from "@/domain/boletim/enterprise/entities/classification.ts";
import {
  Prisma,
} from "@prisma/client";

type PrismaClassificationDetails = Prisma.ClassificationUncheckedUpdateInput

export class ClassificationPresenter {
  static toHTTP(classification: Classification): PrismaClassificationDetails {
    return {
      id: classification.id.toValue(),
      courseId: classification.courseId.toValue(),
      studentId: classification.studentId.toValue(),
      poleId: classification.poleId.toValue(),
      average: classification.average,
      concept: classification.concept,
      assessmentsCount: classification.assessmentsCount,
      status: classification.status,
      behaviorsCount: classification.behaviorsCount
    }
  }
}