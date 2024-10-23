import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'
import { DomainEvents } from '@/core/events/domain-events.ts'

DomainEvents.shouldRun = false

describe('Update Students Batch (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('PUT /students/batch', async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    const administrator = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: '$2a$08$5gtlkFxleDEe1Xsft1HeVOwjXaq7428B46rjjIW7rLFqo1Xz2oWCW',
        role: 'ADMIN'
      }
    })

    const course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'node',
      }
    })

    const pole = await prisma.pole.create({
      data: {
        name: 'pole'
      }
    })

    await prisma.pole.create({
      data: {
        name: 'node-pole'
      }
    })

    await prisma.user.create({
      data: {
        username: 'Test',
        civilId: '00000',
        cpf: '57051810278',
        email: 'test@acne.com',
        password: '1234567',
        birthday: transformDate('20/01/2000'),
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

    await prisma.user.create({
      data: {
        username: 'Test2',
        civilId: '00000',
        cpf: '44059655287',
        email: 'test2@acne.com',
        password: '1234567',
        birthday: transformDate('20/01/2000'),
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

    await prisma.user.create({
      data: {
        username: 'Test3',
        civilId: '00000',
        cpf: '61168939291',
        email: 'test3@acne.com',
        password: '1234567',
        birthday: transformDate('20/01/2000'),
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

    await prisma.user.create({
      data: {
        username: 'Test4',
        civilId: '00000',
        cpf: '10670581240',
        email: 'test4@acne.com',
        password: '1234567',
        birthday: transformDate('20/01/2000'),
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

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-00',
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .put(`/courses/${course.id}/students/batch`)
      .set('Authorization', `Bearer ${token}`)
      .type('multipart/form-data')
      .attach('excel', 'test/upload/students.xlsx')

    expect(response.statusCode).toEqual(204)
  })
})