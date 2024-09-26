import { prisma } from "@/infra/database/lib/prisma.ts"
import { faker } from "@faker-js/faker"
import type { Prisma } from "@prisma/client"

async function seed() {
  await Promise.all([
    prisma.assessment.deleteMany(),
    prisma.behavior.deleteMany(),
    prisma.userOnCourse.deleteMany(),
    prisma.report.deleteMany(),
    prisma.courseOnPole.deleteMany(),
    prisma.courseOnDiscipline.deleteMany(),
    prisma.courseHistoric.deleteMany()
  ])

  await prisma.user.deleteMany()
  await prisma.course.deleteMany()
  await prisma.pole.deleteMany()
  
  await prisma.user.create({
    data: {
      cpf: '05399970210',
      email: 'abreusense@gmail.com',
      username: 'Igor Abreu',
      civilId: '00000',
      password: '$2a$08$IIGNU2kgBV5B9EEQmmm.g.cZy8n1WpEl9xJ.39Qd9f4lNiFXt1Xji',
      birthday: new Date('2002-01-02'),
      role: 'DEV'
    }
  })

  const pole = await prisma.pole.create({
    data: {
      name: 'CFAP',
    }
  })

  const course = await prisma.course.create({
    data: {
      name: 'CAS',
      endsAt: new Date('2050-01-02'),
      formula: 'CAS',
      imageUrl: '',

      courseOnPoles: {
        create: {
          poleId: pole.id
        }
      }
    },
  })

  const studentsToInsert: Prisma.UserUncheckedCreateInput[] = []

  for (let i = 11; i <= 91; i++) {
    studentsToInsert.push({
      cpf: `123456789${i}`,
      email: faker.internet.email(),
      username: faker.person.fullName(),
      civilId: '00000',
      password: '$2a$08$IIGNU2kgBV5B9EEQmmm.g.cZy8n1WpEl9xJ.39Qd9f4lNiFXt1Xji',
      birthday: faker.date.birthdate(),

      usersOnCourses: {
        create: {
          courseId: course.id,
          usersOnPoles: {
            create: {
              poleId: pole.id
            }
          }
        }
      }
    })
  }

  await Promise.all(studentsToInsert.map(async student => {
    await prisma.user.create({
      data: student
    })
  }))
}

seed()  
  .then(() => {
    console.log('Database seeded')
    prisma.$disconnect()
  })