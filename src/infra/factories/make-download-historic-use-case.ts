import { DownloadHistoricUseCase } from "@/domain/boletim/app/use-cases/download-historic.ts";
import { PrismaCourseDisciplinesRepository } from "../database/repositories/prisma-course-disciplines-repository.ts";
import { PrismaCoursesRepository } from "../database/repositories/prisma-courses-repository.ts";
import { PrismaStudentsRepository } from "../database/repositories/prisma-students-repository.ts";
import { GeneratePDF } from "../files/pdf.ts";
import { makeGetStudentAverageInTheCourseUseCase } from "./make-get-student-average-in-the-course-use-case.ts";

export function makeDownloadHistoricUseCase() {
  const coursesRepository = new PrismaCoursesRepository()
  const studentsRepository = new PrismaStudentsRepository()
  const courseDisciplinesRepository = new PrismaCourseDisciplinesRepository()
  const getStudentAverage = makeGetStudentAverageInTheCourseUseCase()
  const pdf = new GeneratePDF()

  return new DownloadHistoricUseCase (
    coursesRepository,
    studentsRepository,
    courseDisciplinesRepository,
    getStudentAverage,
    pdf
  )
}