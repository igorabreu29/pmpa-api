import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { UserPole } from "@/domain/enterprise/entities/user-pole.ts";

export function makeUserPole(
  override: Partial<UserPole> = {},
  id?: UniqueEntityId
) {
  return UserPole.create({
    poleId: new UniqueEntityId(),
    userId: new UniqueEntityId(),
    ...override
  }, id)
}