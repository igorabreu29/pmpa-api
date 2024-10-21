import { CreateAssessmentUseCase } from "@/domain/boletim/app/use-cases/create-assessment.ts";
import { PrismaAssessmentsRepository } from "../database/repositories/prisma-assessments-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaDisciplinesRepository } from "../database/repositories/prisma-disciplines-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { GenerateClassificationJob } from "../classification/generate-classification.ts";

export function makeCreateAssessmentUseCase() {
  const assessmentsRepository = new PrismaAssessmentsRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const disciplinesRepository = new PrismaDisciplinesRepository()
  const studentsRepository = new PrismaStudentsRepository()
  const generateClassification = new GenerateClassificationJob()

  return new CreateAssessmentUseCase(
    assessmentsRepository,
    coursesRepository,
    disciplinesRepository,
    studentsRepository,
    generateClassification
  )
}