import { DownloadHistoricUseCase } from "@/domain/boletim/app/use-cases/download-historic.ts";
import { PrismaCourseDisciplinesRepository } from "../database/repositories/prisma-course-disciplines-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { GeneratePDF } from "../files/pdf.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "./make-get-student-average-in-the-course-use-case.ts";
import { PrismaCourseHistoricsRepository } from "../database/repositories/prisma-course-historics-repository.ts";
import { makeGetCourseClassificationUseCase } from "./make-get-course-classification-use-case.ts";

export function makeDownloadHistoricUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const courseHistoricRepository = new PrismaCourseHistoricsRepository()
  const studentsRepository = new PrismaStudentsRepository()
  const courseDisciplinesRepository = new PrismaCourseDisciplinesRepository()
  const getCourseClassification = makeGetCourseClassificationUseCase()
  const pdf = new GeneratePDF()

  return new DownloadHistoricUseCase (
    coursesRepository,
    courseHistoricRepository,
    studentsRepository,
    courseDisciplinesRepository,
    getCourseClassification,
    pdf
  )
}