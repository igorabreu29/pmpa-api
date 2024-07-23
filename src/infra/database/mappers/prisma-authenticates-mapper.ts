import { formatCPF } from '@/core/utils/formatCPF.ts';
import { Authenticate } from '@/domain/boletim/enterprise/entities/authenticate.ts';
import { CPF } from '@/domain/boletim/enterprise/entities/value-objects/cpf.ts';
import { Password } from '@/domain/boletim/enterprise/entities/value-objects/password.ts';
import { defineRoleAccess } from '@/infra/utils/define-role.ts';
import { Prisma, User as PrismaAuthenticate } from '@prisma/client'

export class PrismaAuthenticatesMapper {
  static toDomain(authenticate: PrismaAuthenticate): Authenticate {
    const formattedCPF = formatCPF(authenticate.cpf)

    const cpfOrError = CPF.create(formattedCPF)
    const passwordOrError = Password.create(authenticate.password)

    if (cpfOrError.isLeft()) throw new Error(cpfOrError.value.message)
    if (passwordOrError.isLeft()) throw new Error(passwordOrError.value.message)

    const authenticateOrError = Authenticate.create({
      cpf: cpfOrError.value,
      passwordHash: passwordOrError.value,
      role: defineRoleAccess(authenticate.role),
      isLoginConfirmed: authenticate.isLoginConfirmed ? true : false
    })
    if (authenticateOrError.isLeft()) throw new Error(authenticateOrError.value.message)

    return authenticateOrError.value
  }
}