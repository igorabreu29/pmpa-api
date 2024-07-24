import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { formatCPF } from '@/core/utils/formatCPF.ts';
import { Student } from '@/domain/boletim/enterprise/entities/student.ts';
import { Birthday } from '@/domain/boletim/enterprise/entities/value-objects/birthday.ts';
import { CPF } from '@/domain/boletim/enterprise/entities/value-objects/cpf.ts';
import { Email } from '@/domain/boletim/enterprise/entities/value-objects/email.ts';
import { Name } from '@/domain/boletim/enterprise/entities/value-objects/name.ts';
import { Password } from '@/domain/boletim/enterprise/entities/value-objects/password.ts';
import { defineRoleAccessToDomain } from '@/infra/utils/define-role.ts';
import { Prisma, User as PrismaStudent } from '@prisma/client'

export class PrismaStudentsMapper {
  static toDomain(student: PrismaStudent): Student {
    const formattedCPF = formatCPF(student.cpf)

    const cpfOrError = CPF.create(formattedCPF)
    const emailOrError = Email.create(student.email)
    const usernameOrError = Name.create(student.username)
    const passwordOrError = Password.create(student.password)
    const birthdayOrError = Birthday.create(student.birthday as Date)

    if (cpfOrError.isLeft()) throw new Error(cpfOrError.value.message)
    if (emailOrError.isLeft()) throw new Error(emailOrError.value.message)
    if (usernameOrError.isLeft()) throw new Error(usernameOrError.value.message)
    if (passwordOrError.isLeft()) throw new Error(passwordOrError.value.message)
    if (birthdayOrError.isLeft()) throw new Error(birthdayOrError.value.message)

    const studentOrError = Student.create({
      username: usernameOrError.value,
      email: emailOrError.value,
      cpf: cpfOrError.value,
      passwordHash: passwordOrError.value,
      birthday: birthdayOrError.value,
      civilId: Number(student.civilId)
    }, new UniqueEntityId(student.id))
    if (studentOrError.isLeft()) throw new Error(studentOrError.value.message)

    return studentOrError.value
  }

  static toPrisma(student: Student): Prisma.UserUncheckedCreateInput {
    return {
      id: student.id.toValue(),
      username: student.username.value,
      cpf: student.cpf.value,
      email: student.email.value,
      password: student.passwordHash.value,
      civilId: String(student.civilId),
      isActive: student.active,
      birthday: student.birthday.value,
      avatarUrl: student.avatarUrl,
      createdAt: student.createdAt,
      role: defineRoleAccessToDomain(student.role)
    }
  }
}