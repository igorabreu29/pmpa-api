import { StudentsBatchRepository } from "@/domain/boletim/app/repositories/students-batch-repository.ts";
import { StudentBatch } from "@/domain/boletim/enterprise/entities/student-batch.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaStudentsMapper } from "../mappers/prisma-students-mapper.ts";
import { PrismaStudentCourseMapper } from "../mappers/prisma-student-course-mapper.ts";
import { PrismaStudentPoleMapper } from "../mappers/prisma-student-pole-mapper.ts";

export class PrismaStudentsBatchRepository implements StudentsBatchRepository {
  async create(studentsBatch: StudentBatch): Promise<void> {
    for (const studentBatch of studentsBatch.students) {
      const prismaStudentMapper = PrismaStudentsMapper.toPrisma(studentBatch.student)
      const prismaStudentCourseMapper = PrismaStudentCourseMapper.toPrisma(studentBatch.studentCourse)
      const prismaStudentPoleMapper = PrismaStudentPoleMapper.toPrisma(studentBatch.studentPole)

      await prisma.user.create({
        data: {
          ...prismaStudentMapper,
          usersOnCourses: {
            create: {
              courseId: prismaStudentCourseMapper.courseId,
              usersOnPoles: {
                create: {
                  poleId: prismaStudentPoleMapper.poleId,
                }
              }
            }
          }
        }
      })
    }
  }
}