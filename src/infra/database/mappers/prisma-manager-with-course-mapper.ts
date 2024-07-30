import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { ManagerWithCourse } from '@/domain/boletim/enterprise/entities/value-objects/manager-with-course.ts';
import { Course, User } from '@prisma/client';

type PrismaManagerWithCourse = User & {
  course: Course
}

export class PrismaManagerCourseDetailsMapper {
  static toDomain(manager: PrismaManagerWithCourse): ManagerWithCourse {
    return ManagerWithCourse.create({
      managerId: new UniqueEntityId(manager.id),
      email: manager.email,
      cpf: manager.cpf,
      assignedAt: manager.createdAt,
      username: manager.username,
      course: manager.course.name,
      imageUrl: manager.course.imageUrl,
      courseId: new UniqueEntityId(manager.course.id),
    })
  }
}