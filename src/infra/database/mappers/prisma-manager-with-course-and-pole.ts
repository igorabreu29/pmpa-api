import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { Course, Pole, User } from '@prisma/client';

type PrismaManagerWithCourseAndPole = User & {
  course: Course
  pole: Pole
}

export class PrismaManagerCourseDetailsMapper {
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