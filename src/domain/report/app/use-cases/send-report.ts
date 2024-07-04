import { Either, left, right } from "@/core/either.ts";
import { ReportsRepository } from "../repositories/reports-repository.ts";
import { Report } from "../../enterprise/entities/report.ts";

export interface SendReportUseCaseRequest {
  title: string
  content: string
}

export type SendReportUseCaseResponse = Either<null, {
  report: Report
}>

export class SendReportUseCase {
  constructor(
    private reportsRepository: ReportsRepository
  ) {}

  async execute({ title, content }: SendReportUseCaseRequest): Promise<SendReportUseCaseResponse> {
    const report = Report.create({
      title,
      content
    })
    await this.reportsRepository.create(report)

    return right({
      report
    })
  }
}