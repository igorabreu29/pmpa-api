import type { Search } from "@/domain/boletim/enterprise/entities/search.ts";
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
      courses: search.courses ? search.courses.map(course => ({
        ...course,
        name: course.name.value,
        endsAt: course.endsAt.value,
      })) : [],
      poles: search.poles ? search.poles.map(pole => ({
        id: pole.id.toValue(),
        name: pole.name.value
      })) : [],
      password: '',
    }
  }
}