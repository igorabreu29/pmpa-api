import { ReportsRepository, type FindManyProps } from "@/domain/report/app/repositories/reports-repository.ts";
import { Report } from "@/domain/report/enterprise/entities/report.ts";

export class InMemoryReportsRepository implements ReportsRepository {
  public items: Report[] = []

  async findByTitle({ title }: { title: string; }): Promise<Report | null> {
    const report = this.items.find(item => item.title === title)
    return report ?? null
  }

  async findMany({ action }: FindManyProps): Promise<Report[]> {
    const reports = this.items
      .filter(item => item.action === action)

    return reports
  }

  async create(report: Report): Promise<void> {
    this.items.push(report)
  }
}