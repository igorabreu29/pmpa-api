import { right, type Either } from "@/core/either.ts";
import type { ReportsRepository } from "@/domain/report/app/repositories/reports-repository.ts";
import type { Report } from "@/domain/report/enterprise/entities/report.ts";

interface FetchReportsUseCaseRequest {
  action?: string
  username?: string
  role: string
  page: number
}

type FetchReportsUseCaseResponse = Either<null, {
  reports: Report[]
  pages: number
  totalItems: number
}>

export class FetchReportsUseCase {
  constructor(
    private reportsRepository: ReportsRepository
  ) {}

  async execute({ action, username, page, role }: FetchReportsUseCaseRequest): Promise<FetchReportsUseCaseResponse> {
    const { reports, pages, totalItems } = await this.reportsRepository.findMany({
      action,
      page,
      role,
      username
    })

    return right({
      reports,
      pages,
      totalItems
    })
  }
}