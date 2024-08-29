import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { formatCPF } from '@/core/utils/formatCPF.ts';
import { Developer } from '@/domain/boletim/enterprise/entities/developer.ts';
import { Birthday } from '@/domain/boletim/enterprise/entities/value-objects/birthday.ts';
import { CPF } from '@/domain/boletim/enterprise/entities/value-objects/cpf.ts';
import { Email } from '@/domain/boletim/enterprise/entities/value-objects/email.ts';
import { Name } from '@/domain/boletim/enterprise/entities/value-objects/name.ts';
import { Password } from '@/domain/boletim/enterprise/entities/value-objects/password.ts';
import { defineRoleAccessToDomain } from '@/infra/utils/define-role.ts';
import { Prisma, User as PrismaDeveloper } from '@prisma/client'

type PrismaDevelopers = PrismaDeveloper & {
  profile?: Prisma.ProfileUncheckedCreateInput
}

type PrismaDevelopersPrismaResponse = Prisma.UserUncheckedCreateInput & {
  profile?: Prisma.ProfileUncheckedCreateInput
}

export class PrismaDevelopersMapper {
  static toDomain(developer: PrismaDevelopers): Developer {
    const formattedCPF = formatCPF(developer.cpf)

    const cpfOrError = CPF.create(formattedCPF)
    const emailOrError = Email.create(developer.email)
    const usernameOrError = Name.create(developer.username)
    const passwordOrError = Password.create(developer.password)
    const birthdayOrError = Birthday.create(developer.birthday as Date)

    if (cpfOrError.isLeft()) throw new Error(cpfOrError.value.message)
    if (emailOrError.isLeft()) throw new Error(emailOrError.value.message)
    if (usernameOrError.isLeft()) throw new Error(usernameOrError.value.message)
    if (passwordOrError.isLeft()) throw new Error(passwordOrError.value.message)
    if (birthdayOrError.isLeft()) throw new Error(birthdayOrError.value.message)

    const developerOrError = Developer.create({
      username: usernameOrError.value,
      email: emailOrError.value,
      cpf: cpfOrError.value,
      passwordHash: passwordOrError.value,
      civilId: developer.civilId,
      birthday: birthdayOrError.value,
      createdAt: developer.createdAt,
      avatarUrl: developer.avatarUrl,
      county: developer?.profile?.county ?? undefined,
      state: developer?.profile?.state ?? undefined,
      militaryId: developer?.profile?.militaryId ?? undefined,
      parent: {
        fatherName: developer?.profile?.fatherName ?? undefined,
        motherName: developer?.profile?.motherName ?? undefined,
      }
    }, new UniqueEntityId(developer.id))
    if (developerOrError.isLeft()) throw new Error(developerOrError.value.message)

    return developerOrError.value
  }

  static toPrisma(developer: Developer): PrismaDevelopersPrismaResponse {
    return {
      id: developer.id.toValue(),
      username: developer.username.value,
      cpf: developer.cpf.value,
      email: developer.email.value,
      password: developer.passwordHash.value,
      civilId: String(developer),
      birthday: developer.birthday?.value,
      avatarUrl: developer.avatarUrl,
      createdAt: developer.createdAt,
      role: defineRoleAccessToDomain(developer.role),
      profile: {
        userId: developer.id.toValue(),
        county: developer.county,
        state: developer.state,
        militaryId: developer.militaryId,
        fatherName: developer.parent?.fatherName,
        motherName: developer.parent?.motherName,
      }
    }
  }
}