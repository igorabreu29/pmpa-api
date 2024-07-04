import { Student } from "../../enterprise/entities/student.ts";

export abstract class StudentsRepository {
  abstract findById(id: string): Promise<Student | null>
  abstract findByCPF(cpf: string): Promise<Student | null>
  abstract findByEmail(email: string): Promise<Student | null>
  abstract create(student: Student): Promise<void>
  abstract save(student: Student): Promise<void>
}