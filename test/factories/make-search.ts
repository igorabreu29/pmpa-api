import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Search } from "@/domain/boletim/enterprise/entities/search.ts";
import { CPF } from "@/domain/boletim/enterprise/entities/value-objects/cpf.ts";
import { Email } from "@/domain/boletim/enterprise/entities/value-objects/email.ts";
import { Name } from "@/domain/boletim/enterprise/entities/value-objects/name.ts";
import { Password } from "@/domain/boletim/enterprise/entities/value-objects/password.ts";
import { faker } from "@faker-js/faker";

export function makeSearch(
  override: Partial<Search> = {},
  id?: UniqueEntityId
) {
  const nameOrError = Name.create(faker.person.fullName())
  if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

  const emailOrError = Email.create(faker.internet.email())
  if (emailOrError.isLeft()) throw new Error(emailOrError.value.message)

  const cpfOrError = CPF.create('000.000.000-00')
  if (cpfOrError.isLeft()) throw new Error(cpfOrError.value.message)

  const passwordOrError = Password.create('test-2020')
  if (passwordOrError.isLeft()) throw new Error(passwordOrError.value.message)

  const searchOrError = Search.create({
    email: emailOrError.value,
    cpf: cpfOrError.value,
    passwordHash: passwordOrError.value,
    username: nameOrError.value,
    civilId: 0e2,
    ...override
  }, id)

  if (searchOrError.isLeft()) throw new Error('Invalid search')
  return searchOrError.value
}