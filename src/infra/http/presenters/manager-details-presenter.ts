import type { ManagerDetails } from "@/domain/boletim/enterprise/entities/value-objects/manager-details.ts";
import { 
  Prisma,
  User,
  Pole as PrismaPole,
 } from "@prisma/client";
import { dayjs } from '@/infra/libs/dayjs.ts'

type PrismaManagersDetails = Prisma.UserUncheckedCreateInput & {
  poles: PrismaPole[]
  courses: Prisma.CourseUncheckedUpdateInput[]
}

export class ManagerDetailsPresenter {
  static toHTTP(managerDetails: ManagerDetails): PrismaManagersDetails {
    return {
      id: managerDetails.managerId.toValue(),
      cpf: managerDetails.cpf,
      civilId: String(managerDetails.civilId),
      email: managerDetails.email,
      username: managerDetails.username,
      password: '',
      avatarUrl: managerDetails.avatarUrl ? managerDetails.avatarUrl : null,
      birthday: dayjs(managerDetails.birthday).format('DD/MM/YYYY'),
      role: 'MANAGER',
      courses: managerDetails.courses.map(({ course, managerCourseId }) => ({
        managerCourseId: managerCourseId.toValue(),
        id: course.id.toValue(),
        name: course.name.value,
        formula: course.formula,
        endsAt: course.endsAt.value,
        imageUrl: course.imageUrl,
      })),
      poles: managerDetails.poles.map(({ pole, managerPoleId }) => ({
        managerPoleId,
        id: pole.id.toValue(),
        name: pole.name.value
      }))
    }
  }
}