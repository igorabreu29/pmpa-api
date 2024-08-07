import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { formatCPF } from '@/core/utils/formatCPF.ts';
import { Manager } from '@/domain/boletim/enterprise/entities/manager.ts';
import { Birthday } from '@/domain/boletim/enterprise/entities/value-objects/birthday.ts';
import { CPF } from '@/domain/boletim/enterprise/entities/value-objects/cpf.ts';
import { Email } from '@/domain/boletim/enterprise/entities/value-objects/email.ts';
import { Name } from '@/domain/boletim/enterprise/entities/value-objects/name.ts';
import { Password } from '@/domain/boletim/enterprise/entities/value-objects/password.ts';
import { defineRoleAccessToDomain } from '@/infra/utils/define-role.ts';
import { Prisma, User as PrismaManager } from '@prisma/client'

export class PrismaManagersMapper {
  static toDomain(manager: PrismaManager): Manager {
    const formattedCPF = formatCPF(manager.cpf)

    const cpfOrError = CPF.create(formattedCPF)
    const emailOrError = Email.create(manager.email)
    const usernameOrError = Name.create(manager.username)
    const passwordOrError = Password.create(manager.password)
    const birthdayOrError = Birthday.create(manager.birthday as Date)

    if (cpfOrError.isLeft()) throw new Error(cpfOrError.value.message)
    if (emailOrError.isLeft()) throw new Error(emailOrError.value.message)
    if (usernameOrError.isLeft()) throw new Error(usernameOrError.value.message)
    if (passwordOrError.isLeft()) throw new Error(passwordOrError.value.message)
    if (birthdayOrError.isLeft()) throw new Error(birthdayOrError.value.message)

    const managerOrError = Manager.create({
      username: usernameOrError.value,
      email: emailOrError.value,
      cpf: cpfOrError.value,
      passwordHash: passwordOrError.value,
      birthday: birthdayOrError.value,
      civilId: Number(manager.civilId)
    }, new UniqueEntityId(manager.id))
    if (managerOrError.isLeft()) throw new Error(managerOrError.value.message)

    return managerOrError.value
  }

  static toPrisma(manager: Manager): Prisma.UserUncheckedCreateInput {
    return {
      id: manager.id.toValue(),
      username: manager.username.value,
      cpf: manager.cpf.value,
      email: manager.email.value,
      password: manager.passwordHash.value,
      civilId: String(manager.civilId),
      birthday: manager.birthday.value,
      avatarUrl: manager.avatarUrl,
      createdAt: manager.createdAt,
      role: defineRoleAccessToDomain(manager.role)
    }
  }
}