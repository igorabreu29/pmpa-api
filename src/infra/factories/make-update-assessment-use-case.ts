import { PrismaAssessmentsRepository } from "../database/repositories/prisma-assessments-repository.ts";
import { UpdateAssessmentUseCaseUseCase } from "@/domain/boletim/app/use-cases/update-assessment.ts";

export function makeUpdateAssessmentUseCase() {
  const assessmentsRepository = new PrismaAssessmentsRepository()
  return new UpdateAssessmentUseCaseUseCase(
    assessmentsRepository
  )
}
