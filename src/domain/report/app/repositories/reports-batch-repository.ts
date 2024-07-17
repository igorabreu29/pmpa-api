import { ReportBatch } from "../../enterprise/entities/report-batch.ts";

export abstract class ReportsBatchRepository {
  abstract create(reportBatch: ReportBatch): Promise<ReportBatch>
}