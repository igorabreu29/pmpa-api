import { StudentsPolesRepository } from "@/domain/boletim/app/repositories/students-poles-repository.ts";
import { StudentPole } from "@/domain/boletim/enterprise/entities/student-pole.ts";
import { StudentWithPole } from "@/domain/boletim/enterprise/entities/value-objects/student-with-pole.ts";
import { InMemoryPolesRepository } from "./in-memory-poles-repository.ts";
import { InMemoryStudentsRepository } from "./in-memory-students-repository.ts";
import { InMemoryStudentsCoursesRepository } from "./in-memory-students-courses-repository.ts";
import { InMemoryCoursesRepository } from "./in-memory-courses-repository.ts";

export class InMemoryStudentsPolesRepository implements StudentsPolesRepository {
  public items: StudentPole[] = []

  constructor (
    private studentsRepository: InMemoryStudentsRepository,
    private studentsCoursesRepository: InMemoryStudentsCoursesRepository,
    private coursesRepository: InMemoryCoursesRepository,
    private polesRepository: InMemoryPolesRepository
  ) {}

  async findByStudentId({ studentId }: { studentId: string; }): Promise<StudentPole | null> {
    const studentPole = this.items.find(item => item.studentId.toValue() === studentId)
    return studentPole ?? null
  }

  async findByStudentIdAndPoleId({ studentId, poleId }: { studentId: string; poleId: string; }): Promise<StudentPole | null> {
    const studentPole = this.items.find(item => item.studentId.toValue() === studentId && item.poleId.toValue() === poleId)
    return studentPole ?? null
  }

  async findManyByPoleId({
    poleId, 
    page, 
    perPage 
  }: { 
    poleId: string; 
    page?: number; 
    perPage?: number; 
  }): Promise<{
    studentsPole: StudentWithPole[],
    pages: number
    totalItems: number
  }> {
    const allStudentsPole = this.items
      .filter(item => item.poleId.toValue() === poleId)
      .map(studentPole => {
        const pole = this.polesRepository.items.find(pole => pole.id.equals(studentPole.poleId))
        if (!pole) throw new Error(`Pole with ID ${studentPole.poleId.toValue()} does not exist`)

        const studentCourse = this.studentsCoursesRepository.items.find(studentCourse => studentCourse.id.equals(studentPole.studentId))
        if (!studentCourse) throw new Error(`Student with ID ${studentPole.studentId.toValue()} does not exist.`)
        
        const student = this.studentsRepository.items.find(student => student.id.equals(studentCourse.studentId))
        if (!student) throw new Error(`Student with ID ${studentPole.studentId.toValue()} does not exist.`)

        return StudentWithPole.create({
          studentId: student.id,
          username: student.username.value,
          email: student.email.value,
          civilId: student.civilId,
          cpf: student.cpf.value,
          birthday: student.birthday.value,
          assignedAt: student.createdAt,
          isLoginConfirmed: student.isLoginConfirmed,
          poleId: pole.id,
          pole: pole.name.value
        })
      })

      const studentsPole = page && perPage ? allStudentsPole.slice((page - 1) * perPage, page * perPage) : allStudentsPole
      const pages = perPage ? Math.ceil(allStudentsPole.length / perPage) : 0

      return {
        studentsPole, 
        pages,
        totalItems: allStudentsPole.length
      }
    }

  async create(studentPole: StudentPole): Promise<void> {
    this.items.push(studentPole)
  }

  async createMany(studentsPoles: StudentPole[]): Promise<void> {
    studentsPoles.forEach(studentPole => {
      this.items.push(studentPole)
    })
  }
}