import type { ClassificationsRepository, FindByCourseAndStudentId, FindManyByCourseIdRequest, FindManyByCourseIdResponse } from "@/domain/boletim/app/repositories/classifications-repository.ts";
import type { Classification } from "@/domain/boletim/enterprise/entities/classification.ts";
import { prisma } from "../lib/prisma.ts";

export class PrismaClassificationsRepository implements ClassificationsRepository {
  async findByCourseAndStudentId({ courseId, studentId }: FindByCourseAndStudentId): Promise<Classification | null> {
    const classification = await prisma.classification.findFirst({
      where: {
        courseId,
        studentId
      },

      include: {
        student: {
          select: {
            id: true,
            birthday: true,
            assessments: true
          }
        }
      }
    })
  }

  async findManyByCourseId({ courseId, page }: FindManyByCourseIdRequest): Promise<FindManyByCourseIdResponse> {
    
  }

  async createMany(classifications: Classification[]): Promise<void> {
    const rows = classifications.map(classification => ({
      id: classification.id.toValue(),
      courseId: classification.courseId.toValue(),
      studentId: classification.studentId.toValue(),
      average: classification.generalAverage,
      status: classification.status,
      concept: classification.concept,
      behaviorAverage: classification.behaviorAverage,
      behaviorStatus: classification.behaviorStatus,
    }))
    
    await prisma.classification.createMany({
      data: rows
    })
  }

  async save(classification: Classification): Promise<void> {
    
  }

  async saveMany(classifications: Classification[]): Promise<void> {
    
  }
}