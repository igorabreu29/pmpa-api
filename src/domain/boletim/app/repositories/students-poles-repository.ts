import { StudentPole } from "../../enterprise/entities/student-pole.ts";
import { StudentCourseDetails } from "../../enterprise/entities/value-objects/student-course-details.ts";
import { StudentWithPole } from "../../enterprise/entities/value-objects/student-with-pole.ts";

export interface SearchManyDetailsByPole {
  poleId: string
  query: string
  page: number
}

export abstract class StudentsPolesRepository {
  abstract findByStudentId({ studentId }: { studentId: string }): Promise<StudentPole | null>
  abstract findByStudentIdAndPoleId({ studentId, poleId }: { studentId: string, poleId: string }): Promise<StudentPole | null>
  abstract findLoginConfirmationMetricsByPoleId({ poleId }: { poleId: string }): Promise<{
    totalConfirmedSize: number
    totalNotConfirmedSize: number
  }>

  abstract findManyByPoleId({ poleId, page, cpf, username, perPage }: { poleId: string, page?: number, cpf?: string, username?: string, perPage?: number }): Promise<{
    studentsPole: StudentWithPole[],
    pages: number
    totalItems: number
  }>

  abstract searchManyDetailsByPoleId({
    poleId,
    query,
    page
  }: SearchManyDetailsByPole): Promise<{
    studentCoursesDetails: StudentCourseDetails[]
    pages: number
    totalItems: number
  }>
  
  abstract create(studentPole: StudentPole): Promise<void>
  abstract createMany(studentsPoles: StudentPole[]): Promise<void>

  abstract delete(studentPole: StudentPole): Promise<void>
}