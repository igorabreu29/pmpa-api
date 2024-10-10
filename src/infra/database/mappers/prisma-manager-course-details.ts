import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { ManagerCourseDetails } from '@/domain/boletim/enterprise/entities/value-objects/manager-course-details.ts';
import { Course, Pole, Prisma, User, UserOnCourse } from '@prisma/client';

type PrismaManagerWithCourseAndPole = User & {
  course: Course
  pole: Pole
  userOnCourse: UserOnCourse
  profile?: Prisma.ProfileUncheckedCreateInput
}

export class PrismaManagerCourseDetailsMapper {
  static toDomain(manager: PrismaManagerWithCourseAndPole): ManagerCourseDetails {
    return ManagerCourseDetails.create({
      managerId: new UniqueEntityId(manager.id),
      email: manager.email,
      cpf: manager.cpf,
      isActive: manager.userOnCourse.isActive,
      reason: manager.userOnCourse.reason ?? undefined,
      civilId: manager.civilId,
      militaryId: manager.profile?.militaryId ?? undefined,
      state: manager.profile?.state ?? undefined,
      county: manager.profile?.county ?? undefined,
      parent: {
        fatherName: manager.profile?.fatherName ?? undefined,
        motherName: manager.profile?.motherName ?? undefined
      },
      assignedAt: manager.createdAt,
      username: manager.username,
      birthday: manager.birthday as Date,
      course: manager.course.name,
      courseId: new UniqueEntityId(manager.course.id),
      pole: manager.pole.name,
      poleId: new UniqueEntityId(manager.pole.id)
    })
  }
}