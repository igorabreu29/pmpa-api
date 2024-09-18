import type { StudentDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-details.ts";
import { dayjs } from '@/infra/libs/dayjs.ts'

import { 
  Prisma,
  Pole as PrismaPole
 } from "@prisma/client";

type PrismaStudentsDetails = Prisma.UserUncheckedCreateInput & {
  profile?: Prisma.ProfileUncheckedUpdateInput
  poles: PrismaPole[]
  courses: Prisma.CourseUncheckedCreateInput[]
}

export class StudentDetailsPresenter {
  static toHTTP(studentDetails: StudentDetails): PrismaStudentsDetails {
    return {
      id: studentDetails.studentId.toValue(),
      cpf: studentDetails.cpf,
      civilId: studentDetails.civilId,
      email: studentDetails.email,
      username: studentDetails.username,
      password: '',
      avatarUrl: studentDetails.avatarUrl ? studentDetails.avatarUrl : null,
      birthday: dayjs(studentDetails.birthday).format('DD/MM/YYYY'),
      role: 'STUDENT',
      profile: {
        county: studentDetails.county,
        state: studentDetails.state,
        militaryId: studentDetails.militaryId,
        fatherName: studentDetails.parent?.fatherName,
        motherName: studentDetails.parent?.motherName,
      },
      courses: studentDetails.courses.map(({ course, studentCourseId }) => ({
        studentCourseId: studentCourseId.toValue(),
        id: course.id.toValue(),
        name: course.name.value,
        formula: course.formula,
        endsAt: course.endsAt.value,
        imageUrl: course.imageUrl,
      })),
      poles: studentDetails.poles.map(({ pole, studentPoleId }) => ({
        studentPoleId,
        id: pole.id.toValue(),
        name: pole.name.value
      }))
    }
  }
}