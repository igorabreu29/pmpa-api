import { Either, left, right } from "@/core/either.ts";
import { Report, TypeAction } from "../../enterprise/entities/report.ts";
import { ReportsRepository } from "../repositories/reports-repository.ts";

export interface SendReportBatchUseCaseRequest {
  reporterId: string
  courseId?: string
  reporterIp: string
  title: string
  content: string
  fileName: string
  fileLink: string
  action: TypeAction
}

export type SendReportBatchUseCaseResponse = Either<null, {
  report: Report
}>

export class SendReportBatchUseCase {
  constructor(
    private reportsRepository: ReportsRepository
  ) {}

  async execute({ title, content, reporterIp, reporterId, courseId, fileLink, fileName, action }: SendReportBatchUseCaseRequest): Promise<SendReportBatchUseCaseResponse> {
    const report = Report.create({
      title,
      content,
      ip: reporterIp, 
      reporterId,
      courseId,
      fileLink,
      fileName,
      action
    })
    await this.reportsRepository.create(report)

    return right({
      report
    })
  }
}