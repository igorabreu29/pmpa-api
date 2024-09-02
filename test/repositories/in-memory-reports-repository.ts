import { ReportsRepository, type FindManyByCourseAndReporterProps, type FindManyProps } from "@/domain/report/app/repositories/reports-repository.ts";
import { Report } from "@/domain/report/enterprise/entities/report.ts";

export class InMemoryReportsRepository implements ReportsRepository {
  public items: Report[] = []

  async findByTitle({ title }: { title: string; }): Promise<Report | null> {
    const report = this.items.find(item => item.title === title)
    return report ?? null
  }

  async findMany({ action, page }: FindManyProps): Promise<{
    reports: Report[]
    pages: number
    totalItems: number
  }> {
    const PER_PAGE = 10

    const allReports = this.items
      .filter(item => item.action.includes(action))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    const reports = allReports.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    const totalItems = this.items.length
    const pages = Math.ceil(totalItems / PER_PAGE)

    return {
      reports,
      totalItems,
      pages
    }
  }

  async findManyByCourseAndReporterId({ 
    courseId, 
    reporterId, 
    action, 
    page 
  }: FindManyByCourseAndReporterProps): Promise<{ 
    reports: Report[]
    pages: number
    totalItems: number 
  }> {
    const PER_PAGE = 10

    const allReports = this.items
      .filter(item => {
        return item.action.includes(action) && 
          item.courseId === courseId &&
          item.reporterId === reporterId
      })
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    const reports = allReports.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    const totalItems = this.items.length
    const pages = Math.ceil(totalItems / PER_PAGE)

    return {
      reports,
      totalItems,
      pages
    }
  }

  async create(report: Report): Promise<void> {
    this.items.push(report)
  }
}