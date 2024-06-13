import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Pole } from "@/domain/enterprise/entities/pole.ts";
import { faker } from "@faker-js/faker";

export function makePole(
  override: Partial<Pole> = {},
  id?: UniqueEntityId
) {
  return Pole.create({
    name: faker.lorem.word(6),
    ...override
  }, id)
}