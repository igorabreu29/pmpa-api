import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ManagerPole } from "@/domain/boletim/enterprise/entities/manager-pole.ts";

export function makeManagerPole(
  override: Partial<ManagerPole> = {},
  id?: UniqueEntityId
) {
  return ManagerPole.create({
    poleId: new UniqueEntityId(),
    managerId: new UniqueEntityId(),
    ...override
  }, id)
}