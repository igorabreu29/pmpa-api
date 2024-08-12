import type { Administrator } from "@/domain/boletim/enterprise/entities/administrator.ts";
import type { Prisma } from "@prisma/client";

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
      birthday: administrator.birthday.value,
    }
  }
}