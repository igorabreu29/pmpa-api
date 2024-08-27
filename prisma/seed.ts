import { prisma } from "@/infra/database/lib/prisma.ts"
import type { Prisma } from "@prisma/client"

async function seed() {
  await prisma.user.deleteMany()
  await prisma.course.deleteMany()
  await prisma.pole.deleteMany()
  await prisma.userOnCourse.deleteMany()

  const [course, pole] = await Promise.all([
    prisma.course.create({
      data: {
        name: 'CAS',
        endsAt: new Date('2050-01-02'),
        formula: 'CAS',
        imageUrl: '',
      }
    }),
    prisma.pole.create({
      data: {
        name: 'CFAP',
      }
    })
  ])

  const studentsToInsert: Prisma.UserUncheckedCreateInput[] = []

  for (let i = 11; i < 26; i++) {
    studentsToInsert.push({
      cpf: `123456789${i}`,
      email: `john${i}@acne.com`,
      username: `john-${i}`,
      civilId: '00000',
      password: '$2a$08$IIGNU2kgBV5B9EEQmmm.g.cZy8n1WpEl9xJ.39Qd9f4lNiFXt1Xji',
      birthday: new Date('2002-01-02'),

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