import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Discipline } from "@/domain/boletim/enterprise/entities/discipline.ts";
import { Name } from "@/domain/boletim/enterprise/entities/value-objects/name.ts";
import { faker } from "@faker-js/faker";

export function makeDiscipline(
  override: Partial<Discipline> = {},
  id?: UniqueEntityId
) {
  const nameOrError = Name.create(faker.lorem.slug())
  if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

  const disciplineOrError = Discipline.create({
    name: nameOrError.value,
    ...override
  }, id)
  if (disciplineOrError.isLeft()) throw new Error(disciplineOrError.value.message)

  return disciplineOrError.value
}