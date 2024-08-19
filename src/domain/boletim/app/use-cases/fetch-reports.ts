import { right, type Either } from "@/core/either.ts";
import type { ReportsRepository } from "@/domain/report/app/repositories/reports-repository.ts";
import type { Report, TypeAction } from "@/domain/report/enterprise/entities/report.ts";

interface FetchReportsUseCaseRequest {
  page: number
  action?: TypeAction
}

type FetchReportsUseCaseResponse = Either<null, {
  reports: Report[]
}>

export class FetchReportsUseCase {
  constructor(
    private reportsRepository: ReportsRepository
  ) {}

  async execute({ page, action }: FetchReportsUseCaseRequest): Promise<FetchReportsUseCaseResponse> {
    const reports = await this.reportsRepository.findMany({ page, action })
    return right({
      reports,
    })
  }
}