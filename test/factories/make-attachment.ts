import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Attachment } from "@/domain/boletim/enterprise/entities/attachment.ts";
import { faker } from "@faker-js/faker";

export function makeAttachment(
  override: Partial<Attachment> = {},
  id?: UniqueEntityId
) {
  return Attachment.create({
    courseId: new UniqueEntityId(),
    fileName: faker.lorem.words(6),
    fileLink: faker.internet.url(),
    ...override
  }, id)
}