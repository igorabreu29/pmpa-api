import { OnManagerCreated } from "@/domain/report/app/subscribers/on-manager-created.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnManagerCreated() {
  const reportersRepository = new PrismaReportersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReportUseCase = makeSendReportUseCase()
  return new OnManagerCreated (
    reportersRepository,
    coursesRepository,
    sendReportUseCase
  )
}