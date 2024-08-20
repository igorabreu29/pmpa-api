import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { StudentWithCourse } from '@/domain/boletim/enterprise/entities/value-objects/student-with-course.ts';
import { Course, User } from '@prisma/client';

type PrismaStudentWithCourse = User & {
  course: Course
}

export class PrismaStudentWithCourseMapper {
  static toDomain(student: PrismaStudentWithCourse): StudentWithCourse {
    return StudentWithCourse.create({
      studentId: new UniqueEntityId(student.id),
      email: student.email,
      cpf: student.cpf,
      assignedAt: student.createdAt,
      username: student.username,
      course: student.course.name,
      imageUrl: student.course.imageUrl,
      courseId: new UniqueEntityId(student.course.id),
    })
  }
}