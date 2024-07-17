import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Pole } from "@/domain/boletim/enterprise/entities/pole.ts";
import { Name } from "@/domain/boletim/enterprise/entities/value-objects/name.ts";
import { faker } from "@faker-js/faker";

export function makePole(
  override: Partial<Pole> = {},
  id?: UniqueEntityId
) {
  const nameOrError = Name.create(faker.lorem.words(6))
  if (nameOrError.isLeft()) throw new Error('Invalid name')

  const poleOrError = Pole.create({
    name: nameOrError.value,
    ...override
  }, id)
  
  if (poleOrError.isLeft()) throw new Error('Invalid pole')
  return poleOrError.value
}