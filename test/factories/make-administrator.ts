import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Administrator } from "@/domain/boletim/enterprise/entities/administrator.ts";
import { Birthday } from "@/domain/boletim/enterprise/entities/value-objects/birthday.ts";
import { CPF } from "@/domain/boletim/enterprise/entities/value-objects/cpf.ts";
import { Email } from "@/domain/boletim/enterprise/entities/value-objects/email.ts";
import { Name } from "@/domain/boletim/enterprise/entities/value-objects/name.ts";
import { Password } from "@/domain/boletim/enterprise/entities/value-objects/password.ts";
import { faker } from "@faker-js/faker";

export function makeAdministrator(
  override: Partial<Administrator> = {},
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

  const birthdayOrError = Birthday.create(new Date('2004-1-2'))
  if (birthdayOrError.isLeft()) throw new Error(birthdayOrError.value.message)

  const administratorOrError = Administrator.create({
    email: emailOrError.value,
    cpf: cpfOrError.value,
    passwordHash: passwordOrError.value,
    username: nameOrError.value,
    birthday: birthdayOrError.value,
    civilId: faker.number.int(),
    ...override
  }, id)
  if (administratorOrError.isLeft()) throw new Error('Invalid administrator')

  return administratorOrError.value
}