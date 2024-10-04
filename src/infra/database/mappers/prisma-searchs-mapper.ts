import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { formatCPF } from '@/core/utils/formatCPF.ts';
import { Course } from '@/domain/boletim/enterprise/entities/course.ts';
import { Pole } from '@/domain/boletim/enterprise/entities/pole.ts';
import { Search } from '@/domain/boletim/enterprise/entities/search.ts';
import { CPF } from '@/domain/boletim/enterprise/entities/value-objects/cpf.ts';
import { Email } from '@/domain/boletim/enterprise/entities/value-objects/email.ts';
import { EndsAt } from '@/domain/boletim/enterprise/entities/value-objects/ends-at.ts';
import { Name } from '@/domain/boletim/enterprise/entities/value-objects/name.ts';
import { defineRoleAccessToPrisma } from '@/infra/utils/define-role.ts';
import {
  User as PrismaUser,
  Pole as PrismaPole,
  Course as PrismaCourse,
  Prisma,
  Role
} from '@prisma/client';

type PrismaSearchsDetails = Prisma.UserUpdateInput & {
  poles: PrismaPole[]
  courses: PrismaCourse[]
  searchCourses: Prisma.UserOnCourseUncheckedCreateInput[]
  searchPoles: Prisma.UserCourseOnPoleUncheckedCreateInput[]
}

export class PrismaSearchsDetailsMapper {
  static toDomain(search: PrismaSearchsDetails): Search {
    const nameOrError = Name.create(search.username as string)
    if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

    const emailOrError = Email.create(search.email as string)
    if (emailOrError.isLeft()) throw new Error(emailOrError.value.message)

    const formattedCPF = formatCPF(search.cpf as string)
    const cpfOrError = CPF.create(formattedCPF)
    if (cpfOrError.isLeft()) throw new Error(cpfOrError.value.message)

    const searchOrError = Search.create({
      username: nameOrError.value,
      civilId: String(search.civilId),
      cpf: cpfOrError.value,
      email: emailOrError.value,
      role: defineRoleAccessToPrisma(search.role as Role),
      courses: search.searchCourses.map(searchCourse => {
        const course = search.courses.find(course => course.id === searchCourse.courseId)
        if (!course) throw new Error('Curso não existente.')

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

        return {
          searchCourseId: new UniqueEntityId(searchCourse.id),
          course: courseOrError.value
        }
      }),
      poles: search.searchPoles.map(searchPole => {
        const pole = search.poles.find(pole => pole.id === searchPole.poleId)
        if (!pole) throw new Error('Polo não encontrado!')

        const nameOrError = Name.create(pole.name)
        if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

        const poleOrError = Pole.create({
          name: nameOrError.value
        }, new UniqueEntityId(pole.id))
        if (poleOrError.isLeft()) throw new Error(poleOrError.value.message)

        return {
          searchPoleId: new UniqueEntityId(searchPole.id),
          pole: poleOrError.value
        }
      })
    }, new UniqueEntityId(search.id as string))

    if (searchOrError.isLeft()) throw new Error(searchOrError.value.message)

    return searchOrError.value
  }
}