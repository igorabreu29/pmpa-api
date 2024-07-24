import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { StudentWithCourseAndPole } from '@/domain/boletim/enterprise/entities/value-objects/student-with-course-and-pole.ts';
import { Course, Pole, User } from '@prisma/client';

type PrismaStudentWithCourseAndPole = User & {
  course: Course
  pole: Pole
}

export class PrismaStudentWithCourseAndPoleMapper {
  static toDomain(student: PrismaStudentWithCourseAndPole): StudentWithCourseAndPole {
    return StudentWithCourseAndPole.create({
      studentId: new UniqueEntityId(student.id),
      email: student.email,
      cpf: student.cpf,
      civilID: Number(student.civilId),
      assignedAt: student.createdAt,
      username: student.username,
      birthday: student.birthday as Date,
      course: student.course.name,
      courseId: new UniqueEntityId(student.course.id),
      pole: student.pole.name,
      poleId: new UniqueEntityId(student.pole.id)
    })
  }
}