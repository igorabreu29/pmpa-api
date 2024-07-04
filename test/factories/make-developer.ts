import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Developer } from "@/domain/boletim/enterprise/entities/developer.ts";
import { faker } from "@faker-js/faker";

export function makeDeveloper(
  override: Partial<Developer> = {},
  id?: UniqueEntityId
) {
  return Developer.create({
    email: faker.internet.email(),
    cpf: '000.000.000-00',
    passwordHash: `test-hasher`,
    username: faker.person.firstName(),
    ...override
  }, id)
}