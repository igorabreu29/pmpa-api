import { PrismaAssessmentsRepository } from "../database/repositories/prisma-assessments-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaDisciplinesRepository } from "../database/repositories/prisma-disciplines-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { PrismaAssessmentsBathcRepository } from "../database/repositories/prisma-assessments-batch-repository.ts";
import { UpdateAssessmentsBatchUseCase } from "@/domain/boletim/app/use-cases/update-assessments-batch.ts";

export function makeUpdateAssessmentsBatchUseCase() {
  const studentsRepository = new PrismaStudentsRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const disciplinesRepository = new PrismaDisciplinesRepository()
  const assessmentsRepository = new PrismaAssessmentsRepository()
  const assessmentsBatchRepository = new PrismaAssessmentsBathcRepository()
  return new UpdateAssessmentsBatchUseCase(
    studentsRepository,
    coursesRepository,
    disciplinesRepository,
    assessmentsRepository,
    assessmentsBatchRepository
  )
}