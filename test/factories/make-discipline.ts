import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Discipline } from "@/domain/enterprise/entities/discipline.ts";

export function makeDiscipline(
  override: Partial<Discipline> = {},
  id?: UniqueEntityId
) {
  return Discipline.create({
    name: 'Instrução Militar',
    ...override
  }, id)
}