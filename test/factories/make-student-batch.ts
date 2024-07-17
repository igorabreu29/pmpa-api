import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { StudentBatch } from "@/domain/boletim/enterprise/entities/student-batch.ts";
import { faker } from "@faker-js/faker";

export function makeStudentBatch (
  override: Partial<StudentBatch> = {},
  id?: UniqueEntityId
) {
  return StudentBatch.create({
    userId: new UniqueEntityId(),
    courseId: new UniqueEntityId(),
    students: [],
    userIp: faker.internet.ip(),
    fileLink: faker.internet.url(),
    fileName: faker.lorem.slug(),
    ...override
  }, id)
}