import type { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Report } from "@/domain/report/enterprise/entities/report.ts";
import { faker } from "@faker-js/faker";

export function makeReport(
  override: Partial<Report> = {},
  id?: UniqueEntityId
) {
  return Report.create({
    title: faker.lorem.word(),
    content: faker.lorem.text(),
    ip: faker.internet.ip(),
    reporterId: faker.internet.ipv4(),
    action: 'add',
    ...override
  }, id)
}