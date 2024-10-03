import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Name } from "@/domain/boletim/enterprise/entities/value-objects/name.ts";
import { Reporter } from "@/domain/report/enterprise/entities/reporter.ts";
import { defineRoleAccessToPrisma } from "@/infra/utils/define-role.ts";
import type { Prisma } from "@prisma/client";

export class PrismaReportersMapper {
  static toDomain(reporter: Prisma.UserUncheckedCreateInput): Reporter {
    const nameOrError = Name.create(reporter.username)
    if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

    const reporterOrError = Reporter.create({
      username: nameOrError.value,
      role: defineRoleAccessToPrisma(reporter.role ?? 'DEV'),
    }, new UniqueEntityId(reporter.id))
    if (reporterOrError.isLeft()) throw new Error(reporterOrError.value.message)

    return reporterOrError.value
  }
}