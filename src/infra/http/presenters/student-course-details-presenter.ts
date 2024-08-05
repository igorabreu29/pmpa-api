import type { StudentCourseDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-course-details.ts";
import { 
  Prisma,
  Pole as PrismaPole,
 } from "@prisma/client";

type PrismaStudentsDetails = Prisma.UserUncheckedUpdateInput & {
  pole: PrismaPole
  course: Prisma.CourseUncheckedUpdateInput
}

export class StudentCourseDetailsPresenter {
  static toHTTP(studentCourseDetails: StudentCourseDetails): PrismaStudentsDetails {
    return {
      id: studentCourseDetails.studentId.toValue(),
      cpf: studentCourseDetails.cpf,
      civilId: String(studentCourseDetails.civilId),
      email: studentCourseDetails.email,
      username: studentCourseDetails.username,
      birthday: studentCourseDetails.birthday,
      course: {
        name: studentCourseDetails.course,
        id: studentCourseDetails.courseId.toValue()
      },
      pole: {
        id: studentCourseDetails.poleId.toValue(),
        name: studentCourseDetails.pole
      }
    }
  }
}