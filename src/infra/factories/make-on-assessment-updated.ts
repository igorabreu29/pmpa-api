import { OnAssessmentUpdated } from "@/domain/report/app/subscribers/on-assessment-updated.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaDisciplinesRepository } from "../database/repositories/prisma-disciplines-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeUpdateStudentClassificationUseCase } from "./make-update-student-classification-use-case.ts";
import { OnAssessmentUpdatedClassification } from "@/domain/boletim/app/classification/subscribers/on-assessment-updated-classification.ts";

export function makeOnAssessmentUpdated() {
  const studentsRepository = new PrismaStudentsRepository()
  const reportersRepository = new PrismaReportersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const disciplinesRepository = new PrismaDisciplinesRepository()
  const sendReportUseCase = makeSendReportUseCase()
  
  new OnAssessmentUpdated(
    studentsRepository,
    reportersRepository,
    coursesRepository,
    disciplinesRepository,
    sendReportUseCase
  )

  const updateStudentClassificationUseCase = makeUpdateStudentClassificationUseCase()
  return new OnAssessmentUpdatedClassification(
    updateStudentClassificationUseCase
  )
}