import { Either, left, right } from "@/core/either.ts";
import { ReportsRepository } from "../repositories/reports-repository.ts";
import { Report, TypeAction } from "../../enterprise/entities/report.ts";

export interface SendReportUseCaseRequest {
  reporterId: string
  courseId?: string
  ip: string
  title: string
  content: string
  action: TypeAction
}

export type SendReportUseCaseResponse = Either<null, {
  report: Report
}>

export class SendReportUseCase {
  constructor(
    private reportsRepository: ReportsRepository
  ) {}

  async execute({ title, content, ip, reporterId, courseId, action }: SendReportUseCaseRequest): Promise<SendReportUseCaseResponse> {
    const report = Report.create({
      title,
      content,
      ip, 
      reporterId,
      courseId,
      action
    })
    await this.reportsRepository.create(report)

    return right({
      report
    })
  }
}