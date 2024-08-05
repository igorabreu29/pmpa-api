import { StudentWithPole } from "@/domain/boletim/enterprise/entities/value-objects/student-with-pole.ts"
import type { Pole, Prisma } from "@prisma/client"

type PrismaStudentWithPole = Prisma.UserUncheckedUpdateInput & {
  pole: Pole
}

export class StudentWithPolePresenter {
  static toHTTP(studentWithPole: StudentWithPole): PrismaStudentWithPole {
    return {
      id: studentWithPole.studentId.toValue(),
      username: studentWithPole.username,
      email: studentWithPole.email,
      cpf: studentWithPole.cpf,
      pole: {
        id: studentWithPole.poleId.toValue(),
        name: studentWithPole.pole
      }
    }
  }
}