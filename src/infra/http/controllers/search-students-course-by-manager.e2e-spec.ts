import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import bcrypt from 'bcryptjs'
import request from 'supertest'
import { Course, Pole } from '@prisma/client'

let course: Course
let course2: Course
let pole: Pole
let pole2: Pole

describe('Search Students Course By Manager (e2e)', () => {
  beforeAll(async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'cas-course'
      }
    })

    course2 = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CGS',
        imageUrl: '',
        name: 'cgs-course',
      }
    })

    pole = await prisma.pole.create({
      data: {
        name: 'pole-1'
      }
    })

    pole2 = await prisma.pole.create({
      data: {
        name: 'pole-2'
      }
    })

    const student = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/02/2001'),
      },
    })

    await prisma.userOnCourse.create({
      data: {
        courseId: course.id,
        userId: student.id,
        usersOnPoles: {
          create: {
            poleId: pole.id
          }
        }
      }
    })

    await prisma.userOnCourse.create({
      data: {
        courseId: course2.id,
        userId: student.id,
        usersOnPoles: {
          create: {
            poleId: pole2.id
          }
        }
      }
    })

    await prisma.user.create({
      data: {
        username: 'Jonas Doe',
        civilId: '02345',
        cpf: '00000000011',
        email: 'jonas@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/02/2001'),
        
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
      },
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })
  
  it ('GET /manager/students/search', async () => {
    const manager = await prisma.user.create({
      data: {
        username: 'July Doe',
        civilId: '02346',
        cpf: '12345678911',
        email: 'july@acne.com', 
        password: await bcrypt.hash('node-21', 8),
        role: 'MANAGER',
        birthday: transformDate('01/04/2001'),

        usersOnCourses: {
          create: {
            courseId: course2.id,
            usersOnPoles: {
              create: {
                poleId: pole2.id
              }
            }
          }
        }
      }
    })

    await prisma.userOnCourse.create({
      data: {
        courseId: course.id,
        userId: manager.id,

        usersOnPoles: {
          create: {
            poleId: pole.id
          }
        }
      }
    })

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: manager.cpf,
        password: 'node-21'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/manager/students/search?query=Jo&page=1`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const { students } = response.body

    expect(response.statusCode).toEqual(200)
    expect(students).toMatchObject([
      {
        username: 'John Doe'
      },
      {
        username: 'Jonas Doe'
      },
    ])
  })
})