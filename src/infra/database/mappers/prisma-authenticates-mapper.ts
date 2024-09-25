import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { formatCPF } from '@/core/utils/formatCPF.ts';
import { Authenticate } from '@/domain/boletim/enterprise/entities/authenticate.ts';
import { CPF } from '@/domain/boletim/enterprise/entities/value-objects/cpf.ts';
import { Email } from '@/domain/boletim/enterprise/entities/value-objects/email.ts';
import { Password } from '@/domain/boletim/enterprise/entities/value-objects/password.ts';
import { defineRoleAccessToPrisma } from '@/infra/utils/define-role.ts';
import { Prisma, User as PrismaAuthenticate } from '@prisma/client'

export class PrismaAuthenticatesMapper {
  static toDomain(authenticate: PrismaAuthenticate): Authenticate {
    const formattedCPF = formatCPF(authenticate.cpf)

    const cpfOrError = CPF.create(formattedCPF)
    const passwordOrError = Password.create(authenticate.password)
    const emailOrError = Email.create(authenticate.email)

    if (cpfOrError.isLeft()) throw new Error(cpfOrError.value.message)
    if (passwordOrError.isLeft()) throw new Error(passwordOrError.value.message)
    if (emailOrError.isLeft()) throw new Error(emailOrError.value.message)

    const authenticateOrError = Authenticate.create({
      cpf: cpfOrError.value,
      passwordHash: passwordOrError.value,
      role: defineRoleAccessToPrisma(authenticate.role),
      email: emailOrError.value,
      isLoginConfirmed: authenticate.isLoginConfirmed ? true : false
    }, new UniqueEntityId(authenticate.id))
    
    if (authenticateOrError.isLeft()) throw new Error(authenticateOrError.value.message)

    return authenticateOrError.value
  }
}