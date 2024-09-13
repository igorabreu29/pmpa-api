import type { Search } from "@/domain/boletim/enterprise/entities/search.ts";
import { defineRoleAccessToDomain } from "@/infra/utils/define-role.ts";
import { 
  Prisma,
  Pole as PrismaPole,
 } from "@prisma/client";

type PrismaSearchDetails = Prisma.UserUncheckedUpdateInput & {
  poles: PrismaPole[]
  courses: Prisma.CourseUncheckedUpdateInput[]
}

export class SearchPresenter {
  static toHTTP(search: Search): PrismaSearchDetails {
    return {
      id: search.id.toValue(),
      cpf: search.cpf.value,
      civilId: String(search.civilId),
      email: search.email.value,
      username: search.username.value,
      role: defineRoleAccessToDomain(search.role),
      courses: search.courses ? search.courses.map(({ course, searchCourseId }) => ({
        id: course.id.toValue(),
        name: course.name.value,
        imageUrl: course.imageUrl,
        userOnCourseId: searchCourseId.toValue()
      })) : [],
      poles: search.poles ? search.poles.map(({ pole, searchPoleId }) => ({
        id: pole.id.toValue(),
        name: pole.name.value,
        userCourseOnPoleId: searchPoleId.toValue()
      })) : [],
      password: '',
    }
  }
}