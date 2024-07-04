import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Criterion } from "@/domain/boletim/enterprise/entities/criterion.ts";
import { faker } from "@faker-js/faker";

export function makeCriterion (
  override: Partial<Criterion> = {},
  id?: UniqueEntityId
) {
  return Criterion.create({
    name: faker.hacker.verb(),
    ...override
  }, id)
}