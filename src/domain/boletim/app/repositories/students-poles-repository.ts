import { StudentPole } from "../../enterprise/entities/student-pole.ts";

export abstract class StudentsPolesRepository {
  abstract findByStudentIdAndPoleId({ studentId, poleId }: { studentId: string, poleId: string }): Promise<StudentPole | null>
  abstract create(studentPole: StudentPole): Promise<void>
}