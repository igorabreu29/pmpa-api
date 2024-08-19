import { right, type Either } from "@/core/either.ts";
import type { ReportsRepository } from "@/domain/report/app/repositories/reports-repository.ts";
import type { Report } from "@/domain/report/enterprise/entities/report.ts";
import { ManagersCoursesRepository } from "../repositories/managers-courses-repository.ts";

interface FetchReportsByManagerUseCaseRequest {
  courseId: string
  managerId: string
  action: string
}

type FetchReportsByManagerUseCaseResponse = Either<null, {
  reports: Report[]
}>

export class FetchReportsByManagerUseCase {
  constructor(
    private managerCoursesRepository: ManagersCoursesRepository,
    private reportsRepository: ReportsRepository
  ) {}

  async execute({ action }: FetchReportsByManagerUseCaseRequest): Promise<FetchReportsByManagerUseCaseResponse> {
    const reports = await this.reportsRepository.findMany({ action })
    return right({
      reports,
    })
  }
}