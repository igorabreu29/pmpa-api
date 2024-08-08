import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { formatCPF } from '@/core/utils/formatCPF.ts';
import { Administrator } from '@/domain/boletim/enterprise/entities/administrator.ts';
import { Birthday } from '@/domain/boletim/enterprise/entities/value-objects/birthday.ts';
import { CPF } from '@/domain/boletim/enterprise/entities/value-objects/cpf.ts';
import { Email } from '@/domain/boletim/enterprise/entities/value-objects/email.ts';
import { Name } from '@/domain/boletim/enterprise/entities/value-objects/name.ts';
import { Password } from '@/domain/boletim/enterprise/entities/value-objects/password.ts';
import { defineRoleAccessToDomain } from '@/infra/utils/define-role.ts';
import { Prisma, User as PrismaAdministrator } from '@prisma/client'

export class PrismaAdministratorsMapper {
  static toDomain(administrator: PrismaAdministrator): Administrator {
    const formattedCPF = formatCPF(administrator.cpf)

    const cpfOrError = CPF.create(formattedCPF)
    const emailOrError = Email.create(administrator.email)
    const usernameOrError = Name.create(administrator.username)
    const passwordOrError = Password.create(administrator.password)
    const birthdayOrError = Birthday.create(administrator.birthday as Date)

    if (cpfOrError.isLeft()) throw new Error(cpfOrError.value.message)
    if (emailOrError.isLeft()) throw new Error(emailOrError.value.message)
    if (usernameOrError.isLeft()) throw new Error(usernameOrError.value.message)
    if (passwordOrError.isLeft()) throw new Error(passwordOrError.value.message)
    if (birthdayOrError.isLeft()) throw new Error(birthdayOrError.value.message)

    const administratorOrError = Administrator.create({
      username: usernameOrError.value,
      email: emailOrError.value,
      cpf: cpfOrError.value,
      passwordHash: passwordOrError.value,
      birthday: birthdayOrError.value,
      civilId: Number(administrator.civilId)
    }, new UniqueEntityId(administrator.id))
    if (administratorOrError.isLeft()) throw new Error(administratorOrError.value.message)

    return administratorOrError.value
  }

  static toPrisma(administrator: Administrator): Prisma.UserUncheckedCreateInput {
    return {
      id: administrator.id.toValue(),
      username: administrator.username.value,
      cpf: administrator.cpf.value,
      email: administrator.email.value,
      password: administrator.passwordHash.value,
      civilId: String(administrator.civilId),
      birthday: administrator.birthday.value,
      avatarUrl: administrator.avatarUrl,
      createdAt: administrator.createdAt,
      role: defineRoleAccessToDomain(administrator.role)
    }
  }
}