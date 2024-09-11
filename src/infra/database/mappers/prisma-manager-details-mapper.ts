import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { Course } from '@/domain/boletim/enterprise/entities/course.ts';
import { Pole } from '@/domain/boletim/enterprise/entities/pole.ts';
import { EndsAt } from '@/domain/boletim/enterprise/entities/value-objects/ends-at.ts';
import { ManagerDetails } from '@/domain/boletim/enterprise/entities/value-objects/manager-details.ts';
import { Name } from '@/domain/boletim/enterprise/entities/value-objects/name.ts';
import { defineRoleAccessToPrisma } from '@/infra/utils/define-role.ts';
import {
  User as PrismaManager,
  Pole as PrismaPole,
  Course as PrismaCourse,
  Prisma
} from '@prisma/client';

type PrismaManagersDetails = PrismaManager & Prisma.ProfileUpdateInput & {
  poles: PrismaPole[]
  courses: PrismaCourse[]
  managerCourses: Prisma.UserOnCourseUncheckedCreateInput[]
  managerPoles: Prisma.UserCourseOnPoleUncheckedCreateInput[]
}

export class PrismaManagerDetailsMapper {
  static toDomain(managerDetails: PrismaManagersDetails): ManagerDetails {
    const manager = ManagerDetails.create({
      managerId: new UniqueEntityId(managerDetails.id),
      username: managerDetails.username,
      birthday: managerDetails.birthday as Date,
      civilId: managerDetails.civilId,
      cpf: managerDetails.cpf,
      email: managerDetails.email,
      assignedAt: managerDetails.createdAt,
      avatarUrl: managerDetails.avatarUrl ?? undefined,
      role: defineRoleAccessToPrisma(managerDetails.role),
      courses: managerDetails.courses.map(course => {
        const nameOrError = Name.create(course.name)
        const endsAtOrError = EndsAt.create(course.endsAt)
        if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)
        if (endsAtOrError.isLeft()) throw new Error(endsAtOrError.value.message)

        const courseOrError = Course.create({
          name: nameOrError.value,
          formula: course.formula,
          endsAt: endsAtOrError.value,
          imageUrl: course.imageUrl,
          isActive: course.isActive,
          isPeriod: course.isPeriod,
          startAt: course.startAt
        }, new UniqueEntityId(course.id))
        if (courseOrError.isLeft()) throw new Error(courseOrError.value.message)

        const managerCourse = managerDetails.managerCourses.find(managerCourse => {
          return managerCourse.courseId === course.id
        })
        if (!managerCourse) throw new Error('Course not found.')

        return {
          managerCourseId: new UniqueEntityId(managerCourse.id),
          course: courseOrError.value
        }
      }),
      poles: managerDetails.poles.map(pole => {
        const nameOrError = Name.create(pole.name)
        if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

        const poleOrError = Pole.create({
          name: nameOrError.value
        }, new UniqueEntityId(pole.id))
        if (poleOrError.isLeft()) throw new Error(poleOrError.value.message)

        const managerPole = managerDetails.managerPoles.find(managerPole => {
          return managerPole.poleId === pole.id
        })
        if (!managerPole) throw new Error('Pole not found.')

        return {
          managerPoleId: new UniqueEntityId(managerPole.id),
          pole: poleOrError.value
        }
      })
    })

    return manager
  }
}