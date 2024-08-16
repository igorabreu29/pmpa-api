import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Report } from "@/domain/report/enterprise/entities/report.ts";
import type { Prisma, Report as PrismaReport } from "@prisma/client";

export class PrismaReportsMapper {
  static toDomain(report: PrismaReport): Report {
    return Report.create({
      reporterId: report.reporterId,
      title: report.title,
      content: report.content,
      action: 'add',
      ip: report.ip,
      createdAt: report.createdAt,
    }, new UniqueEntityId(report.id))
  }

  static toPrisma(report: Report): Prisma.ReportUncheckedCreateInput {
    return {
      id: report.id.toValue(),
      reporterId: report.reporterId,
      title: report.title,
      content: report.content,
      action: 'ADD',
      ip: report.ip,
      createdAt: report.createdAt
    }
  }
}