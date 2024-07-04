import { Report } from "../../enterprise/entities/report.ts";

export abstract class ReportsRepository {
  abstract findByTitle({ title }: { title: string }): Promise<Report | null>
  abstract create(report: Report): Promise<void>
}