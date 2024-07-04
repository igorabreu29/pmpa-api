import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Administrator } from "@/domain/boletim/enterprise/entities/administrator.ts";
import { faker } from "@faker-js/faker";

export function makeAdministrator(
  override: Partial<Administrator> = {},
  id?: UniqueEntityId
) {
  return Administrator.create({
    email: faker.internet.email(),
    cpf: '000.000.000-00',
    passwordHash: `test-hasher`,
    username: faker.person.firstName(),
    birthday: faker.date.birthdate(),
    civilID: faker.number.int(),
    ...override
  }, id)
}