import { StudentCourse } from "../../enterprise/entities/student-course.ts";

export abstract class StudentsCoursesRepository {
  abstract findByStudentIdAndCourseId({ studentId, courseId }: { studentId: string, courseId: string }): Promise<StudentCourse | null>
  abstract create(studentCourse: StudentCourse): Promise<void>
}