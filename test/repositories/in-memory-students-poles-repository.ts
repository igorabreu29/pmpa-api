import { StudentsPolesRepository } from "@/domain/boletim/app/repositories/students-poles-repository.ts";
import { StudentCourse } from "@/domain/boletim/enterprise/entities/student-course.ts";
import { StudentPole } from "@/domain/boletim/enterprise/entities/student-pole.ts";

export class InMemoryStudentsPolesRepository implements StudentsPolesRepository {
  public items: StudentPole[] = []

  async findByStudentIdAndPoleId({ studentId, poleId }: { studentId: string; poleId: string; }): Promise<StudentPole | null> {
    const studentCourse = this.items.find(item => item.studentId.toValue() === studentId && item.poleId.toValue() === poleId)
    return studentCourse ?? null
  }

  async create(studentPole: StudentPole): Promise<void> {
    this.items.push(studentPole)
  }
}