import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Name } from "@/domain/boletim/enterprise/entities/value-objects/name.ts";
import { Reporter } from "@/domain/report/enterprise/entities/reporter.ts";
import { faker } from "@faker-js/faker";

export function makeReporter (
  override: Partial<Reporter> = {},
  id?: UniqueEntityId
) {
  const nameOrError = Name.create(faker.person.firstName())
  if (nameOrError.isLeft()) throw new Error('Invalid name')

  const reporterOrError = Reporter.create({
    username: nameOrError.value,
    role: 'student',
    ...override
  }, id)
  if (reporterOrError.isLeft()) throw new Error('Invalid reporter')

  return reporterOrError.value
}