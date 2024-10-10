import { OnBehaviorDeleted } from "@/domain/report/app/subscribers/on-behavior-deleted.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { OnBehaviorRemovedGrade } from "@/domain/report/app/subscribers/on-behavior-removed-grade.ts";

export function makeOnBehaviorRemovedGrade() {
  const studentsRepository = new PrismaStudentsRepository()
  const reportersRepository = new PrismaReportersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReportUseCase = makeSendReportUseCase()
  return new OnBehaviorRemovedGrade(
    studentsRepository,
    reportersRepository,
    coursesRepository,
    sendReportUseCase
  )
}