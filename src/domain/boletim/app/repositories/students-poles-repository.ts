import { StudentPole } from "../../enterprise/entities/student-pole.ts";
import { StudentWithPole } from "../../enterprise/entities/value-objects/student-with-pole.ts";

export abstract class StudentsPolesRepository {
  abstract findByStudentId({ studentId }: { studentId: string }): Promise<StudentPole | null>
  abstract findByStudentIdAndPoleId({ studentId, poleId }: { studentId: string, poleId: string }): Promise<StudentPole | null>
  abstract findManyByPoleId({ poleId, page, perPage }: { poleId: string, page?: number, perPage?: number }): Promise<{
    studentsPole: StudentWithPole[],
    pages: number
    totalItems: number
  }>
  abstract create(studentPole: StudentPole): Promise<void>
  abstract createMany(studentsPoles: StudentPole[]): Promise<void>
}