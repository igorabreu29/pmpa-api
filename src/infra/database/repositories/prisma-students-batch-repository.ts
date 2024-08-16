import { StudentsBatchRepository } from "@/domain/boletim/app/repositories/students-batch-repository.ts";
import { StudentBatch } from "@/domain/boletim/enterprise/entities/student-batch.ts";
import { prisma } from "../lib/prisma.ts";
import { PrismaStudentsMapper } from "../mappers/prisma-students-mapper.ts";
import { PrismaStudentCourseMapper } from "../mappers/prisma-student-course-mapper.ts";
import { PrismaStudentPoleMapper } from "../mappers/prisma-student-pole-mapper.ts";
import { DomainEvents } from "@/core/events/domain-events.ts";

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

    DomainEvents.dispatchEventsForAggregate(studentsBatch.id)
  }

  async save(studentBatch: StudentBatch): Promise<void> {
    const prismaMapper = studentBatch.students.map(({ student }) => PrismaStudentsMapper.toPrisma(student))

    await Promise.all(prismaMapper.map(async item => {
      await prisma.user.update({
        where: {
          id: item.id
        },

        data: item
      })
    }))

    DomainEvents.dispatchEventsForAggregate(studentBatch.id)
  }
}