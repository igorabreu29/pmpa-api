import type { StudentDetails } from "@/domain/boletim/enterprise/entities/value-objects/student-details.ts";
import { dayjs } from '@/infra/libs/dayjs.ts'

import { 
  Prisma,
  Pole as PrismaPole,
  Course as PrismaCourse
 } from "@prisma/client";

type PrismaStudentsDetails = Prisma.UserUncheckedCreateInput & {
  profile?: Prisma.ProfileUncheckedUpdateInput
  poles: PrismaPole[]
  courses: PrismaCourse[]
}

export class StudentDetailsPresenter {
  static toHTTP(studentDetails: StudentDetails): PrismaStudentsDetails {
    return {
      id: studentDetails.studentId.toValue(),
      cpf: studentDetails.cpf,
      civilId: String(studentDetails.civilId),
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
      courses: studentDetails.courses.map(course => ({
        id: course.id.toValue(),
        endsAt: course.endsAt.value,
        formula: course.formula,
        imageUrl: course.imageUrl,
        isActive: course.isActive,
        isPeriod: course.isPeriod,
        name: course.name.value,
        startAt: course.startAt
      })),
      poles: studentDetails.poles.map(pole => ({
        id: pole.id.toValue(),
        name: pole.name.value
      }))
    }
  }
}