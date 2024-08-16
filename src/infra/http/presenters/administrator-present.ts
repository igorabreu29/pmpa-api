import type { Administrator } from "@/domain/boletim/enterprise/entities/administrator.ts";
import type { Prisma } from "@prisma/client";
import { dayjs } from '@/infra/libs/dayjs.ts'

export class AdministratorPresenter {
  static toHTTP(administrator: Administrator): Prisma.UserUncheckedCreateInput {
    return {
      id: administrator.id.toValue(),
      cpf: administrator.cpf.value,
      civilId: String(administrator.civilId),
      email: administrator.email.value,
      username: administrator.username.value,
      password: '',
      avatarUrl: administrator.avatarUrl ? administrator.avatarUrl : null,
      birthday: dayjs(administrator.birthday.value).format('DD/MM/YYYY'),
    }
  }
}