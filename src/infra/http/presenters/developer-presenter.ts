import type { Developer } from "@/domain/boletim/enterprise/entities/developer.ts";
import type { Prisma } from "@prisma/client";
import { dayjs } from '@/infra/libs/dayjs.ts'
import { defineRoleAccessToDomain } from "@/infra/utils/define-role.ts";

export class DeveloperPresenter {
  static toHTTP(developer: Developer): Prisma.UserUncheckedCreateInput & Prisma.ProfileUncheckedUpdateInput {
    return {
      id: developer.id.toValue(),
      cpf: developer.cpf.value,
      civilId: developer.civilId ?? '',
      militaryId: developer.militaryId ?? '',
      state: developer.state ?? '',
      county: developer.county ?? '',
      fatherName: developer.parent?.fatherName ?? '',
      motherName: developer.parent?.motherName ?? '',
      email: developer.email.value,
      username: developer.username.value,
      password: '',
      role: defineRoleAccessToDomain(developer.role),
      avatarUrl: developer.avatarUrl ? developer.avatarUrl : null,
      birthday: dayjs(developer.birthday.value).format('DD/MM/YYYY'),
    }
  }
}