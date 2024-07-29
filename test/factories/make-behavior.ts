import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Behavior } from "@/domain/boletim/enterprise/entities/behavior.ts";
import { faker } from "@faker-js/faker";

export function makeBehavior(
  override: Partial<Behavior> = {},
  id?: UniqueEntityId
): Behavior {
  return Behavior.create({
    studentId: new UniqueEntityId(),
    courseId: new UniqueEntityId(),
    currentYear: new Date().getFullYear(),
    ...override
  }, id)
}