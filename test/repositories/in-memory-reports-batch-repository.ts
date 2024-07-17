import { ReportsBatchRepository } from "@/domain/report/app/repositories/reports-batch-repository.ts";
import { ReportBatch } from "@/domain/report/enterprise/entities/report-batch.ts";

export class InMemoryReportsBatchRepository implements ReportsBatchRepository {
  public items: ReportBatch[] = []

  async create(reportBatch: ReportBatch): Promise<ReportBatch> {
    this.items.push(reportBatch)
    return reportBatch
  }
}