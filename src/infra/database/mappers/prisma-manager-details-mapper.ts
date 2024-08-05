import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { Course } from '@/domain/boletim/enterprise/entities/course.ts';
import { Pole } from '@/domain/boletim/enterprise/entities/pole.ts';
import { EndsAt } from '@/domain/boletim/enterprise/entities/value-objects/ends-at.ts';
import { ManagerDetails } from '@/domain/boletim/enterprise/entities/value-objects/manager-details.ts';
import { Name } from '@/domain/boletim/enterprise/entities/value-objects/name.ts';
import {
  User as PrismaManagerDetails,
  Pole as PrismaPole,
  Course as PrismaCourse
} from '@prisma/client';

type PrismaManagersDetails = PrismaManagerDetails & {
  poles: PrismaPole[]
  courses: PrismaCourse[]
}

export class PrismaManagerDetailsMapper {
  static toDomain(managerDetails: PrismaManagersDetails): ManagerDetails {
    const manager = ManagerDetails.create({
      managerId: new UniqueEntityId(managerDetails.id),
      username: managerDetails.username,
      birthday: managerDetails.birthday as Date,
      civilId: Number(managerDetails.civilId),
      cpf: managerDetails.cpf,
      email: managerDetails.email,
      isActive: managerDetails.isActive,
      assignedAt: managerDetails.createdAt,
      avatarUrl: managerDetails.avatarUrl ?? undefined,
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

        return courseOrError.value
      }),
      poles: managerDetails.poles.map(pole => {
        const nameOrError = Name.create(pole.name)
        if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

        const poleOrError = Pole.create({
          name: nameOrError.value
        }, new UniqueEntityId(pole.id))
        if (poleOrError.isLeft()) throw new Error(poleOrError.value.message)

        return poleOrError.value
      })
    })

    return manager
  }
}