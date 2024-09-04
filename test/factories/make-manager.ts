import { UniqueEntityId } from "@/core/entities/unique-entity-id.ts";
import { Manager } from "@/domain/boletim/enterprise/entities/manager.ts";
import { Birthday } from "@/domain/boletim/enterprise/entities/value-objects/birthday.ts";
import { CPF } from "@/domain/boletim/enterprise/entities/value-objects/cpf.ts";
import { Email } from "@/domain/boletim/enterprise/entities/value-objects/email.ts";
import { Name } from "@/domain/boletim/enterprise/entities/value-objects/name.ts";
import { Password } from "@/domain/boletim/enterprise/entities/value-objects/password.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { PrismaManagersMapper } from "@/infra/database/mappers/prisma-managers-mapper.ts";
import { faker } from "@faker-js/faker";

export function makeManager(
  override: Partial<Manager> = {},
  id?: UniqueEntityId
) {
  const nameOrError = Name.create(faker.person.fullName())
  if (nameOrError.isLeft()) throw new Error(nameOrError.value.message)

  const emailOrError = Email.create(faker.internet.email())
  if (emailOrError.isLeft()) throw new Error(emailOrError.value.message)

  const cpfOrError = CPF.create('000.000.000-00')
  if (cpfOrError.isLeft()) throw new Error(cpfOrError.value.message)

  const passwordOrError = Password.create('test-2020')
  if (passwordOrError.isLeft()) throw new Error(passwordOrError.value.message)

  const birthdayOrError = Birthday.create(new Date('2004-1-2'))
  if (birthdayOrError.isLeft()) throw new Error(birthdayOrError.value.message)

  const managerOrError = Manager.create({
    email: emailOrError.value,
    cpf: cpfOrError.value,
    passwordHash: passwordOrError.value,
    username: nameOrError.value,
    birthday: birthdayOrError.value,
    civilId: '0e5',
    ...override
  }, id)
  if (managerOrError.isLeft()) throw new Error('Invalid manager')
  
  return managerOrError.value
}

export interface MakePrismaManager {
  courseId?: string
  poleId?: string
  data: Partial<Manager>
}

export async function makePrismaManager({
  courseId,
  poleId,
  data,
}: MakePrismaManager) {
  const nameOrError = Name.create(data.username?.value ?? faker.person.firstName())
  if (nameOrError.isLeft()) throw nameOrError.value

  const cpfOrError = CPF.create(data.cpf?.value ?? '000.000.000-00')
  if (cpfOrError.isLeft()) throw cpfOrError.value

  const emailOrError = Email.create(data.email?.value ?? faker.internet.email())
  if (emailOrError.isLeft()) throw emailOrError.value

  const passwordOrError = Password.create(data.passwordHash?.value ?? faker.internet.password())
  if (passwordOrError.isLeft()) throw passwordOrError.value

  const birthdayOrError = Birthday.create(data.birthday?.value ?? faker.date.birthdate())
  if (birthdayOrError.isLeft()) throw birthdayOrError.value

  const student = makeManager({
    ...data,
    username: nameOrError.value,
    civilId: data.civilId ?? '00000',
    cpf: cpfOrError.value,
    email: emailOrError.value,
    passwordHash: passwordOrError.value,
    birthday: birthdayOrError.value,
  })

   await prisma.user.create({
    data: PrismaManagersMapper.toPrisma(student)
  })

  if (courseId && poleId) {
    await prisma.userOnCourse.create({
      data: {
        courseId,
        userId: student.id.toValue(),
        usersOnPoles: {
          create: {
            poleId,
          }
        }
      }
    })
  }

  if (courseId) {
    await prisma.userOnCourse.create({
      data: {
        courseId,
        userId: student.id.toValue(),
        usersOnPoles: {
          create: {
            pole: {
              create: {
                name: faker.commerce.department()
              }
            }
          }
        }
      }
    })
  }

  return student
}