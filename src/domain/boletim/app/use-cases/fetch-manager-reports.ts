import { right, type Either } from "@/core/either.ts";
import type { ReportsRepository } from "@/domain/report/app/repositories/reports-repository.ts";
import type { Report } from "@/domain/report/enterprise/entities/report.ts";

interface FetchManagerReportsUseCaseRequest {
  courseId: string
  managerId: string
  action?: string
  page: number
}

type FetchManagerReportsUseCaseResponse = Either<null, {
  reports: Report[]
  pages: number
  totalItems: number
}>

export class FetchManagerReportsUseCase {
  constructor(
    private reportsRepository: ReportsRepository
  ) {}

  async execute({ courseId, managerId, action, page }: FetchManagerReportsUseCaseRequest): Promise<FetchManagerReportsUseCaseResponse> {
    

    const { reports, pages, totalItems } = await this.reportsRepository.findManyByCourseAndReporterId({
      courseId,
      reporterId: managerId,
      action,
      page
    })
    
    return right({
      reports,
      pages,
      totalItems
    })
  }
}