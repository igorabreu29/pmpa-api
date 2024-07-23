import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { BehaviorBatch } from "@/domain/boletim/enterprise/entities/behavior-batch.ts";
import { faker } from "@faker-js/faker";

export function makeBehaviorBatch (
  override: Partial<BehaviorBatch> = {},
  id?: UniqueEntityId
) {
  return BehaviorBatch.create({
    userId: new UniqueEntityId(),
    courseId: new UniqueEntityId(),
    behaviors: [],
    userIp: faker.internet.ip(),
    fileLink: faker.internet.url(),
    fileName: faker.lorem.slug(),
    ...override
  }, id)
}