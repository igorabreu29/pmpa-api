import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { StudentCourseDetails } from '@/domain/boletim/enterprise/entities/value-objects/student-with-course-and-pole.ts';
import { Course, Pole, User } from '@prisma/client';

type PrismaStudentCourseDetails = User & {
  course: Course
  pole: Pole
}

export class PrismaStudentCourseDetailsMapper {
  static toDomain(student: PrismaStudentCourseDetails): StudentCourseDetails {
    return StudentCourseDetails.create({
      studentId: new UniqueEntityId(student.id),
      email: student.email,
      cpf: student.cpf,
      civilId: Number(student.civilId),
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