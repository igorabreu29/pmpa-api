import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Authenticate } from "@/domain/boletim/enterprise/entities/authenticate.ts";
import { CPF } from "@/domain/boletim/enterprise/entities/value-objects/cpf.ts";
import { Email } from "@/domain/boletim/enterprise/entities/value-objects/email.ts";
import { Password } from "@/domain/boletim/enterprise/entities/value-objects/password.ts";
import { faker } from "@faker-js/faker";

export function makeAuthenticate (
  override: Partial<Authenticate> = {},
  id?: UniqueEntityId
) {
  const cpfOrError = CPF.create('000.000.000-00')
  if (cpfOrError.isLeft()) throw new Error(cpfOrError.value.message)

  const passwordOrError = Password.create('test-2020')
  if (passwordOrError.isLeft()) throw new Error(passwordOrError.value.message)

  const emailOrError = Email.create(faker.internet.email())
  if (emailOrError.isLeft()) throw new Error(emailOrError.value.message)

  const authenticateOrError = Authenticate.create({
    cpf: cpfOrError.value,
    email: emailOrError.value,
    passwordHash: passwordOrError.value,
    role: 'student',
    ...override
  }, id)

  if (authenticateOrError.isLeft()) throw new Error('Invalid authenticate')
  return authenticateOrError.value
} 