import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { StudentWithPole } from '@/domain/boletim/enterprise/entities/value-objects/student-with-pole.ts';
import { Pole, User } from '@prisma/client';

type PrismaStudentWithPole = User & {
  pole: Pole
}

export class PrismaStudentWithPoleMapper {
  static toDomain(student: PrismaStudentWithPole): StudentWithPole {
    return StudentWithPole.create({
      studentId: new UniqueEntityId(student.id),
      email: student.email,
      cpf: student.cpf,
      civilId: Number(student.civilId),
      assignedAt: student.createdAt,
      username: student.username,
      birthday: student.birthday as Date,
      isLoginConfirmed: student.isLoginConfirmed ? true : false,
      pole: student.pole.name,
      poleId: new UniqueEntityId(student.pole.id)
    })
  }
}