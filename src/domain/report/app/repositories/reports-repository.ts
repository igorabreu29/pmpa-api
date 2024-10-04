import { Report, type TypeAction } from "../../enterprise/entities/report.ts";

export interface FindManyProps {
  action?: string
  username?: string
  role: string
  page?: number
}

export interface FindManyByCourseAndReporterProps {
  courseId: string
  reporterId: string
  action?: string
  page: number
}

export abstract class ReportsRepository {
  abstract findByTitle({ title }: { title: string }): Promise<Report | null>
  abstract findMany({ action, username, page, role }: FindManyProps): Promise<{
    reports: Report[]
    pages?: number
    totalItems?: number
  }>
  abstract findManyByCourseAndReporterId({
    courseId,
    reporterId,
    action,
    page
  }: FindManyByCourseAndReporterProps): Promise<{
    reports: Report[]
    pages: number
    totalItems: number
  }>
  abstract create(report: Report): Promise<void>
}