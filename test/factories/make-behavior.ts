import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Behavior } from "@/domain/enterprise/entities/behavior.ts";
import { faker } from "@faker-js/faker";

export function makeBehavior(
  override: Partial<Behavior> = {},
  id?: UniqueEntityId
): Behavior {
  return Behavior.create({
    studentId: new UniqueEntityId(),
    courseId: new UniqueEntityId(),
    poleId: new UniqueEntityId(),
    january: faker.number.int(1),
    february: faker.number.int(1),
    march: faker.number.int(1),
    april: faker.number.int(1),
    may: faker.number.int(1),
    jun: faker.number.int(1),
    currentYear: new Date().getFullYear(),
    ...override
  }, id)
}