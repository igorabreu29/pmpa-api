import type { ManagerDetails } from "@/domain/boletim/enterprise/entities/value-objects/manager-details.ts";
import { 
  Prisma,
  User as PrismaStudent,
  Pole as PrismaPole,
  Course as PrismaCourse
 } from "@prisma/client";
import { dayjs } from '@/infra/libs/dayjs.ts'

type PrismaStudentsDetails = Prisma.UserUncheckedCreateInput & {
  poles: PrismaPole[]
  courses: PrismaCourse[]
}

export class ManagerDetailsPresenter {
  static toHTTP(managerDetails: ManagerDetails): PrismaStudentsDetails {
    return {
      id: managerDetails.managerId.toValue(),
      cpf: managerDetails.cpf,
      civilId: String(managerDetails.civilId),
      email: managerDetails.email,
      username: managerDetails.username,
      password: '',
      avatarUrl: managerDetails.avatarUrl ? managerDetails.avatarUrl : null,
      birthday: dayjs(managerDetails.birthday).format('DD/MM/YYYY'),
      courses: managerDetails.courses.map(course => ({
        id: course.id.toValue(),
        endsAt: course.endsAt.value,
        formula: course.formula,
        imageUrl: course.imageUrl,
        isActive: course.isActive,
        isPeriod: course.isPeriod,
        name: course.name.value,
        startAt: course.startAt
      })),
      poles: managerDetails.poles.map(pole => ({
        id: pole.id.toValue(),
        name: pole.name.value
      }))
    }
  }
}