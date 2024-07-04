import { StudentsCoursesRepository } from "@/domain/boletim/app/repositories/students-courses-repository.ts";
import { StudentCourse } from "@/domain/boletim/enterprise/entities/student-course.ts";

export class InMemoryStudentsCoursesRepository implements StudentsCoursesRepository {
  public items: StudentCourse[] = []

  async findByStudentIdAndCourseId({ studentId, courseId }: { studentId: string; courseId: string; }): Promise<StudentCourse | null> {
    const studentCourse = this.items.find(item => item.studentId.toValue() === studentId && item.courseId.toValue() === courseId)
    return studentCourse ?? null
  }

  async create(studentCourse: StudentCourse): Promise<void> {
    this.items.push(studentCourse)
  }
}