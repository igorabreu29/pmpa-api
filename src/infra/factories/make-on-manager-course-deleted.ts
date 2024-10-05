import { OnManagerCourseDeleted } from "@/domain/report/app/subscribers/on-manager-course-deleted.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaReportersRepository } from "../database/repositories/prisma-reporters-repository.ts";
import { PrismaManagersRepository } from "../database/repositories/prisma-managers-repository.ts";
import { makeSendReportUseCase } from "./make-send-report-use-case.ts";

export function makeOnManagerCourseDeleted() {
  const coursesRepository = new PrismaCoursesRepository()
  const managersRepository = new PrismaManagersRepository()
  const reportersRepository = new PrismaReportersRepository()
  const sendReport = makeSendReportUseCase()

  return new OnManagerCourseDeleted(
    coursesRepository,
    managersRepository,
    reportersRepository,
    sendReport
  )
}