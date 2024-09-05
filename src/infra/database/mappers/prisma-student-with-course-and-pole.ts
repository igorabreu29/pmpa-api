import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { StudentCourseDetails } from '@/domain/boletim/enterprise/entities/value-objects/student-course-details.ts';
import { Course, Pole, User, type Prisma } from '@prisma/client';

type PrismaStudentCourseDetails = User & {
  course: Course
  pole: Pole
  profile?: Prisma.ProfileUncheckedCreateInput
}

export class PrismaStudentCourseDetailsMapper {
  static toDomain(student: PrismaStudentCourseDetails): StudentCourseDetails {
    return StudentCourseDetails.create({
      studentId: new UniqueEntityId(student.id),
      email: student.email,
      cpf: student.cpf,
      civilId: student.civilId,
      militaryId: student.profile?.militaryId ?? undefined,
      state: student.profile?.state ?? undefined,
      county: student.profile?.county ?? undefined,
      parent: {
        fatherName: student.profile?.fatherName ?? undefined,
        motherName: student.profile?.motherName ?? undefined
      },
      assignedAt: student.createdAt,
      username: student.username,
      birthday: student.birthday as Date,
      course: student.course.name,
      courseId: new UniqueEntityId(student.course.id),
      formula: student.course.formula,
      pole: student.pole.name,
      poleId: new UniqueEntityId(student.pole.id)
    })
  }
}