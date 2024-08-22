import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Report } from "@/domain/report/enterprise/entities/report.ts";
import { convertActionToDomain, convertActionToPrisma } from "@/infra/utils/convert-action-by-layer.ts";
import type { Prisma, Report as PrismaReport } from "@prisma/client";

export class PrismaReportsMapper {
  static toDomain(report: PrismaReport): Report {
    return Report.create({
      reporterId: report.reporterId,
      courseId: report.courseId ?? undefined,
      title: report.title,
      content: report.content,
      fileLink: report.filelink ?? undefined,
      fileName: report.filename ?? undefined,
      action: convertActionToDomain(report.action),
      ip: report.ip,
      createdAt: report.createdAt,
    }, new UniqueEntityId(report.id))
  }

  static toPrisma(report: Report): Prisma.ReportUncheckedCreateInput {
    return {
      id: report.id.toValue(),
      reporterId: report.reporterId,
      courseId: report.courseId,
      title: report.title,
      content: report.content,
      filelink: report.fileLink,
      filename: report.fileName,
      action: convertActionToPrisma(report.action),
      ip: report.ip,
      createdAt: report.createdAt
    }
  }
}