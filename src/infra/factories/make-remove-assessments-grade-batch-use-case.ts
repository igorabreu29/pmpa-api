import { PrismaAssessmentsRepository } from "../database/repositories/prisma-assessments-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaDisciplinesRepository } from "../database/repositories/prisma-disciplines-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { PrismaAssessmentsBathcRepository } from "../database/repositories/prisma-assessments-batch-repository.ts";
import { RemoveAssessmentsGradeBatchUseCase } from "@/domain/boletim/app/use-cases/remove-assessments-grade-batch.ts";

export function makeRemoveAssessmentsGradeBatchUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const disciplinesRepository = new PrismaDisciplinesRepository()
  const assessmentsRepository = new PrismaAssessmentsRepository()
  const assessmentsBatchRepository = new PrismaAssessmentsBathcRepository()
  return new RemoveAssessmentsGradeBatchUseCase(
    studentsRepository,
    coursesRepository,
    disciplinesRepository,
    assessmentsRepository,
    assessmentsBatchRepository
  )
}