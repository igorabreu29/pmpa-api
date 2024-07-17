import { Student } from "../../enterprise/entities/student.ts";
import { StudentDetails } from "../../enterprise/entities/value-objects/student-details.ts";

export abstract class StudentsRepository {
  abstract findById(id: string): Promise<Student | null>
  abstract findByCPF(cpf: string): Promise<Student | null>
  abstract findByEmail(email: string): Promise<Student | null>
  abstract findDetailsById(id: string): Promise<StudentDetails | null>
  abstract create(student: Student): Promise<void>
  abstract createMany(students: Student[]): Promise<void>
  abstract save(student: Student): Promise<void>
}