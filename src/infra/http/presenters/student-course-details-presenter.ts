import type { StudentCourseDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-course-details.ts";
import { 
  Prisma,
  Pole as PrismaPole,
 } from "@prisma/client";

import { dayjs } from '@/infra/libs/dayjs.ts'

type PrismaStudentsDetails = Prisma.UserUncheckedUpdateInput & Prisma.ProfileUncheckedUpdateInput & Prisma.UserOnCourseUpdateInput & {
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
      isActive: studentCourseDetails.isActive,
      reason: studentCourseDetails.reason,
      username: studentCourseDetails.username,
      birthday: dayjs(studentCourseDetails.birthday).format('DD/MM/YYYY'),
      createdAt: dayjs(studentCourseDetails.assignedAt).format('DD/MM/YYYY'),
      militaryId: studentCourseDetails.militaryId,
      county: studentCourseDetails.county,
      state: studentCourseDetails.state,
      motherName: studentCourseDetails.parent?.motherName,
      fatherName: studentCourseDetails.parent?.fatherName,
      course: {
        name: studentCourseDetails.course,
        id: studentCourseDetails.courseId.toValue(),
        formula: studentCourseDetails.formula
      },
      pole: {
        id: studentCourseDetails.poleId.toValue(),
        name: studentCourseDetails.pole
      }
    }
  }
}