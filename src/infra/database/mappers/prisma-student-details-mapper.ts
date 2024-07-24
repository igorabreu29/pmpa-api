import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { formatCPF } from '@/core/utils/formatCPF.ts';
import { Course } from '@/domain/boletim/enterprise/entities/course.ts';
import { Pole } from '@/domain/boletim/enterprise/entities/pole.ts';
import { Student } from '@/domain/boletim/enterprise/entities/student.ts';
import { Birthday } from '@/domain/boletim/enterprise/entities/value-objects/birthday.ts';
import { CPF } from '@/domain/boletim/enterprise/entities/value-objects/cpf.ts';
import { Email } from '@/domain/boletim/enterprise/entities/value-objects/email.ts';
import { EndsAt } from '@/domain/boletim/enterprise/entities/value-objects/ends-at.ts';
import { Name } from '@/domain/boletim/enterprise/entities/value-objects/name.ts';
import { Password } from '@/domain/boletim/enterprise/entities/value-objects/password.ts';
import { StudentDetails } from '@/domain/boletim/enterprise/entities/value-objects/student-details.ts';
import { 
  User as PrismaStudent,
  Pole as PrismaPole,
  Course as PrismaCourse
} from '@prisma/client'

type PrismaStudentsDetails = PrismaStudent & {
  poles: PrismaPole[]
  courses: PrismaCourse[]
}

export class PrismaStudentDetailsMapper {
  static toDomain(studentDetails: PrismaStudentsDetails): StudentDetails {
    const student = StudentDetails.create({
      studentId: new UniqueEntityId(studentDetails.id),
      username: studentDetails.username,
      birthday: studentDetails.birthday as Date,
      civilID: Number(studentDetails.civilId),
      cpf: studentDetails.cpf,
      email: studentDetails.email,
      assignedAt: studentDetails.createdAt,
      avatarUrl: studentDetails.avatarUrl ?? undefined,
      courses: studentDetails.courses.map(course => {
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
        })
        if (courseOrError.isLeft()) throw new Error(courseOrError.value.message)

        return courseOrError.value
      }),
      poles: studentDetails.poles.map(pole => {
        const nameOrError = Name.create(pole.name)
        if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

        const poleOrError = Pole.create({
          name: nameOrError.value
        }, new UniqueEntityId(pole.id))
        if (poleOrError.isLeft()) throw new Error(poleOrError.value.message)

        return poleOrError.value
      })
    })

    return student
  }
}