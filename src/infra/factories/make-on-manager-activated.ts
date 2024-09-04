import { OnManagerActivated } from "@/domain/report/app/subscribers/on-manager-activated.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnManagerActivated() {
  const reportersRepository = new PrismaReportersRepository()
  const managersRepository = new PrismaManagersRepository()
  const coursesRepository = new PrismaCoursesRepository()
  const sendReport = makeSendReportUseCase()

  return new OnManagerActivated(
    reportersRepository,
    managersRepository,
    coursesRepository,
    sendReport
  )
}