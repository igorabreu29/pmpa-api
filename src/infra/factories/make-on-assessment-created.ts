import { OnAssessmentCreated } from "@/domain/report/app/subscribers/on-assessment-created.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeCreateStudentClassificationUseCase } from "./make-create-student-classification.ts";
import { OnAssessmentCreatedClassification } from "@/domain/boletim/app/classification/subscribers/on-assessment-created-classification.ts";

export function makeOnAssessmentCreated() {
  const reportersRepository = new PrismaReportersRepository()
  const sendReportUseCase = makeSendReportUseCase()
  new OnAssessmentCreated(
    reportersRepository,
    sendReportUseCase
  )

  const createStudentClassificationUseCase = makeCreateStudentClassificationUseCase()
  return new OnAssessmentCreatedClassification(
    createStudentClassificationUseCase
  )
}