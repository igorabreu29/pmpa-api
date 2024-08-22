import { Report } from '@/domain/report/enterprise/entities/report.ts'
import { Prisma } from '@prisma/client'

export class ReportPresenter {
  static toHTTP(report: Report): Prisma.ReportUncheckedUpdateInput {
    return {
      id: report.id.toValue(),
      title: report.title,
      content: report.content,
      createdAt: report.createdAt,
      filelink: report.fileLink,
      filename: report.fileName,
      ip: report.ip,
    }
  }
}