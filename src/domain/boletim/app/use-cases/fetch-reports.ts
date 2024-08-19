import { right, type Either } from "@/core/either.ts";
import type { ReportsRepository } from "@/domain/report/app/repositories/reports-repository.ts";
import type { Report } from "@/domain/report/enterprise/entities/report.ts";

interface FetchReportsUseCaseRequest {
  action: string
}

type FetchReportsUseCaseResponse = Either<null, {
  reports: Report[]
}>

export class FetchReportsUseCase {
  constructor(
    private reportsRepository: ReportsRepository
  ) {}

  async execute({ action }: FetchReportsUseCaseRequest): Promise<FetchReportsUseCaseResponse> {
    const reports = await this.reportsRepository.findMany({ action })
    return right({
      reports,
    })
  }
}