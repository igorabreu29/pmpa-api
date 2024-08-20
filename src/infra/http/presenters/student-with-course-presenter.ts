import { StudentWithCourse } from "@/domain/boletim/enterprise/entities/value-objects/student-with-course.ts"
import type { Prisma } from "@prisma/client"

type PrismaStudentWithCourse = Prisma.UserUncheckedUpdateInput & {
  course: Prisma.CourseUncheckedUpdateInput
}

export class StudentWithCoursePresenter {
  static toHTTP(studentWithCourse: StudentWithCourse): PrismaStudentWithCourse {
    return {
      id: studentWithCourse.studentId.toValue(),
      username: studentWithCourse.username,
      email: studentWithCourse.email,
      cpf: studentWithCourse.cpf,
      course: {
        id: studentWithCourse.courseId.toValue(),
        name: studentWithCourse.course,
        imageUrl: studentWithCourse.imageUrl
      },
    }
  }
}