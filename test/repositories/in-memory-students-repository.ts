import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { Student } from "@/domain/boletim/enterprise/entities/student.ts";

export class InMemoryStudentsRepository implements StudentsRepository {
  public items: Student[] = []

  async findById(id: string): Promise<Student | null> {
    const student = this.items.find(item => item.id.toValue() === id)
    return student ?? null
  }

  async findByCPF(cpf: string): Promise<Student | null> {
    const student = this.items.find(item => item.cpf === cpf)
    return student ?? null
  }

  async findByEmail(email: string): Promise<Student | null> {
    const student = this.items.find(item => item.email === email)
    return student ?? null
  }

  async create(student: Student): Promise<void> {
    this.items.push(student)
  }

  async save(student: Student): Promise<void> {
    const studentIndex = this.items.findIndex(item => item.id.equals(student.id))
    this.items[studentIndex] = student
  }
}