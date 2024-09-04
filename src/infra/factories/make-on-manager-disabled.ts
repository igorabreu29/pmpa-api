import { OnManagerDisabled } from "@/domain/report/app/subscribers/on-manager-disabled.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnManagerDisabled() {
  const reportersRepository = new PrismaReportersRepository()
  const managersRepository = new PrismaManagersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReport = makeSendReportUseCase()

  return new OnManagerDisabled(
    reportersRepository,
    managersRepository,
    coursesRepository,
    sendReport
  )
}