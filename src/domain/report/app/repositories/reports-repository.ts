import { Report, type TypeAction } from "../../enterprise/entities/report.ts";

export interface FindManyProps {
  page: number
  action?: TypeAction
}

export abstract class ReportsRepository {
  abstract findByTitle({ title }: { title: string }): Promise<Report | null>
  abstract findMany({ action }: FindManyProps): Promise<Report[]>
  abstract create(report: Report): Promise<void>
}