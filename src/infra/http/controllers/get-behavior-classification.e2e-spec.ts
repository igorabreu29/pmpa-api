
import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import type { Course, User } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import bcrypt from 'bcryptjs'
import request from 'supertest'

let course: Course

describe('Get Behavior Classification (e2e)', () => {
  beforeAll(async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'CAS',
        isPeriod: false
      }
    })

    const pole = await prisma.pole.create({
      data: {
        name: 'pole-1'
      }
    })

    const pole2 = await prisma.pole.create({
      data: {
        name: 'pole-2'
      }
    })

    await prisma.courseOnPole.createMany({
      data: [
        {
          courseId: course.id,
          poleId: pole.id
        },
        {
          courseId: course.id,
          poleId: pole2.id
        },
      ]
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

    const student2 = await prisma.user.create({
      data: {
        username: 'Jey Doe',
        civilId: '12345',
        cpf: '00000000011',
        email: 'Jey@acne.com', 
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

    const student3 = await prisma.user.create({
      data: {
        username: 'Test',
        civilId: '12345',
        cpf: '00000000012',
        email: 'test@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/02/2000'),
        
        usersOnCourses: {
          create: {
            courseId: course.id,
             usersOnPoles: {
              create: {
                poleId: pole2.id
              }
             }
          }
        }
      },
    })

    const student4 = await prisma.user.create({
      data: {
        username: 'Test 2',
        civilId: '12345',
        cpf: '00000000013',
        email: 'test2@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/02/2000'),
        
        usersOnCourses: {
          create: {
            courseId: course.id,
             usersOnPoles: {
              create: {
                poleId: pole2.id
              }
             }
          }
        }
      },
    })

    await prisma.behavior.createMany({
      data: [
        {
          january: 7,
          february: 8,
          march: 7.5,
          courseId: course.id,
          studentId: student.id
        },
        {
          january: 9,
          february: 8.25,
          march: 6.35,
          courseId: course.id,
          studentId: student2.id
        },
        {
          january: 9,
          february: 8.25,
          march: 6.35,
          courseId: course.id,
          studentId: student3.id
        },
        {
          january: 10,
          february: 7,
          march: 6.35,
          courseId: course.id,
          studentId: student4.id
        },
      ]
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('GET /courses/:id/classification/behaviors', async () => {
    const developer = await prisma.user.create(({
      data: {
        username: 'Jonas Doe',
        civilId: '02345',
        cpf: '00000000001',
        email: 'jonas@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        birthday: transformDate('02/01/2006'),
        role: 'DEV'
      }
    }))

    const authenticateResponse = await request(app.server)
    .post('/credentials/auth')
    .send({
      cpf: '000.000.000-01',
      password: 'node-20'
    })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/courses/${course.id}/classification/behaviors?page=1`)
      .set('Authorization', `Bearer ${token}`)

    const { behaviorAverageGroupedByPole } = response.body

    expect(behaviorAverageGroupedByPole).toMatchObject([
      {
        behaviorAverageByPole: {
          name: 'pole-2',
          average: 7.825
        },
      },
      {
        behaviorAverageByPole: {
          name: 'pole-1',
          average: 7.684
        },
      },
    ])
  })
})