import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { ManagerWithCourseAndPole } from '@/domain/boletim/enterprise/entities/value-objects/manager-with-course-and-pole.ts';
import { StudentCourseDetails } from '@/domain/boletim/enterprise/entities/value-objects/student-with-course-and-pole.ts';
import { Course, Pole, User } from '@prisma/client';

type PrismaManagerWithCourseAndPole = User & {
  course: Course
  pole: Pole
}

export class PrismaStudentCourseDetailsMapper {
  static toDomain(manager: PrismaManagerWithCourseAndPole): ManagerWithCourseAndPole {
    return ManagerWithCourseAndPole.create({
      managerId: new UniqueEntityId(manager.id),
      email: manager.email,
      cpf: manager.cpf,
      assignedAt: manager.createdAt,
      username: manager.username,
      course: manager.course.name,
      courseId: new UniqueEntityId(manager.course.id),
      pole: manager.pole.name,
      poleId: new UniqueEntityId(manager.pole.id)
    })
  }
}