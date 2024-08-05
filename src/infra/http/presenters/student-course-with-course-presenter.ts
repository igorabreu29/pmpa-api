import { StudentCourseWithCourse } from "@/domain/boletim/enterprise/entities/value-objects/student-course-with-course.ts"
import type { Prisma } from "@prisma/client"

type PrismaStudentCourseWithCourse = Prisma.UserOnCourseUncheckedCreateInput & {
  course: Prisma.CourseUncheckedUpdateInput
}

export class StudentCourseWithCoursePresenter {
  static toHTTP(studentCourseWithCourse: StudentCourseWithCourse): PrismaStudentCourseWithCourse {
    return {
      id: studentCourseWithCourse.studentCourseId.toValue(),
      userId: studentCourseWithCourse.studentId.toValue(),
      courseId: studentCourseWithCourse.courseId.toValue(),
      course: {
        name: studentCourseWithCourse.course,
        imageUrl: studentCourseWithCourse.courseImageUrl
      },
    }
  }
}