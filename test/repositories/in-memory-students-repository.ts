import { StudentsRepository } from "@/domain/boletim/app/repositories/students-repository.ts";
import { Student } from "@/domain/boletim/enterprise/entities/student.ts";
import { InMemoryStudentsCoursesRepository } from "./in-memory-students-courses-repository.ts";
import { InMemoryCoursesRepository } from "./in-memory-courses-repository.ts";
import { InMemoryStudentsPolesRepository } from "./in-memory-students-poles-repository.ts";
import { InMemoryPolesRepository } from "./in-memory-poles-repository.ts";
import { InMemoryCoursesPolesRepository } from "./in-memory-courses-poles-repository.ts";
import { StudentWithCourseAndPole } from "@/domain/boletim/enterprise/entities/value-objects/student-with-course-and-pole.ts";

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