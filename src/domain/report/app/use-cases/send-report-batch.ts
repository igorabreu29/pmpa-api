import { Either, left, right } from "@/core/either.ts";
import { ReportBatch } from "../../enterprise/entities/report-batch.ts";
import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { ReportsBatchRepository } from "../repositories/reports-batch-repository.ts";
import { TypeAction } from "../../enterprise/entities/report.ts";

export interface SendReportBatchUseCaseRequest {
  reporterId: string
  reporterIp: string
  title: string
  content: string
  fileName: string
  fileLink: string
  action: TypeAction
}

export type SendReportBatchUseCaseResponse = Either<null, {
  reportBatch: ReportBatch
}>

export class SendReportBatchUseCase {
  constructor(
    private reportsBatchRepository: ReportsBatchRepository
  ) {}

  async execute({ title, content, reporterIp, reporterId, fileLink, fileName, action }: SendReportBatchUseCaseRequest): Promise<SendReportBatchUseCaseResponse> {
    const reportBatch = ReportBatch.create({
      title,
      content,
      ip: reporterIp, 
      reporterId: new UniqueEntityId(reporterId),
      fileLink,
      fileName,
      action
    })
    await this.reportsBatchRepository.create(reportBatch)

    return right({
      reportBatch
    })
  }
}