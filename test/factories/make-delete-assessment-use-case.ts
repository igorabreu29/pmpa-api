import { DeleteAssessmentUseCaseUseCase } from "@/domain/boletim/app/use-cases/delete-assessment.ts";
import { PrismaAssessmentsRepository } from "@/infra/database/repositories/prisma-assessments-repository.ts";

export function makeDeleteAssessmentUseCase() {
  const assessmentsRepository = new PrismaAssessmentsRepository()
  return new DeleteAssessmentUseCaseUseCase(
    assessmentsRepository
  )
}
