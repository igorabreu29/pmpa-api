import { UniqueEntityId } from '@/core/entities/unique-entity-id.ts';
import { Course } from '@/domain/boletim/enterprise/entities/course.ts';
import { Pole } from '@/domain/boletim/enterprise/entities/pole.ts';
import { EndsAt } from '@/domain/boletim/enterprise/entities/value-objects/ends-at.ts';
import { Name } from '@/domain/boletim/enterprise/entities/value-objects/name.ts';
import { StudentDetails } from '@/domain/boletim/enterprise/entities/value-objects/student-details.ts';
import { defineRoleAccessToPrisma } from '@/infra/utils/define-role.ts';
import {
  User as PrismaStudent,
  Pole as PrismaPole,
  Course as PrismaCourse,
  type Prisma
} from '@prisma/client';

type PrismaStudentsDetails = PrismaStudent & {
  poles: PrismaPole[]
  courses: PrismaCourse[]
  studentCourses: Prisma.UserOnCourseUncheckedCreateInput[]
  studentPoles: Prisma.UserCourseOnPoleUncheckedCreateInput[]
}

export class PrismaStudentDetailsMapper {
  static toDomain(studentDetails: PrismaStudentsDetails): StudentDetails {
    const student = StudentDetails.create({
      studentId: new UniqueEntityId(studentDetails.id),
      username: studentDetails.username,
      birthday: studentDetails.birthday as Date,
      civilId: String(studentDetails.civilId),
      cpf: studentDetails.cpf,
      email: studentDetails.email,
      assignedAt: studentDetails.createdAt,
      avatarUrl: studentDetails.avatarUrl ?? undefined,
      role: defineRoleAccessToPrisma(studentDetails.role),
      courses: studentDetails.courses.map(course => {
        const nameOrError = Name.create(course.name)
        const endsAtOrError = EndsAt.create(course.endsAt)
        if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)
        if (endsAtOrError.isLeft()) throw new Error(endsAtOrError.value.message)

        const courseOrError = Course.create({
          name: nameOrError.value,
          formula: course.formula,
          endsAt: endsAtOrError.value,
          imageUrl: course.imageUrl,
          isActive: course.isActive,
          isPeriod: course.isPeriod,
          startAt: course.startAt
        }, new UniqueEntityId(course.id))
        if (courseOrError.isLeft()) throw new Error(courseOrError.value.message)

        const studentCourse = studentDetails.studentCourses.find(studentCourse => {
          return studentCourse.courseId === course.id
        })
        if (!studentCourse) throw new Error('Curso não existente.')

        return {
          studentCourseId: new UniqueEntityId(studentCourse.id),
          course: courseOrError.value
        }
      }),
      poles: studentDetails.poles.map(pole => {
        const nameOrError = Name.create(pole.name)
        if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

        const poleOrError = Pole.create({
          name: nameOrError.value
        }, new UniqueEntityId(pole.id))
        if (poleOrError.isLeft()) throw new Error(poleOrError.value.message)

        const studentPole = studentDetails.studentPoles.find(studentPole => {
          return studentPole.poleId === pole.id
        })
        if (!studentPole) throw new Error('Pólo não encontrado!')

        return {
          studentPoleId: new UniqueEntityId(studentPole.id),
          pole: poleOrError.value
        }
      })
    })

    return student
  }
}