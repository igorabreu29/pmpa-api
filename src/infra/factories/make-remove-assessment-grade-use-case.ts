import { RemoveAssessmentGradeUseCase } from "@/domain/boletim/app/use-cases/remove-assessment-grade.ts";
import { PrismaAssessmentsRepository } from "../database/repositories/prisma-assessments-repository.ts";

export function makeRemoveAssessmentGradeUseCase() {
  const assessmentsRepository = new PrismaAssessmentsRepository()
  return new RemoveAssessmentGradeUseCase(
    assessmentsRepository
  )
}