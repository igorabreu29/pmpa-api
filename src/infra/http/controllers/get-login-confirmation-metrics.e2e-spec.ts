import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { Course } from '@prisma/client'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import bcrypt from 'bcryptjs'
import request from 'supertest'
import { transformDate } from '@/infra/utils/transform-date.ts'

let course: Course

describe('Get Login Confirmation Metrics (e2e)', () => {
  beforeAll(async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'CAS',
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

    await prisma.user.create({
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

    await prisma.user.create({
      data: {
        username: 'Jelly Doe',
        civilId: '02345',
        cpf: '00000000020',
        email: 'jelly@acne.com', 
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

    await prisma.user.create({
      data: {
        username: 'Jonas Doe',
        civilId: '02345',
        cpf: '00000000011',
        email: 'jonas@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        birthday: transformDate('01/02/2001'),
        
        usersOnCourses: {
          create: {
            courseId: course.id,
            usersOnPoles: {
              create: {
                poleId: pole2.id,
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

  it ('GET /courses/:id/students/metrics', async () => {
    const administrator = await prisma.user.create({
      data: {
        username: 'Jey Doe',
        civilId: '02345',
        cpf: '00000000001',
        email: 'jey@acne.com', 
        password: await bcrypt.hash('node-21', 8),
        role: 'ADMIN'
      }
    })
    
    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: administrator.cpf,
        password: 'node-21'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/courses/${course.id}/students/metrics`)
      .set('Authorization', `Bearer ${token}`)

    const { loginConfirmationMetrics } = response.body

    expect(response.statusCode).toEqual(200)
    expect(loginConfirmationMetrics).toMatchObject([
      {
        pole: 'pole-1',
        metrics: {
          totalConfirmedSize: 2,
          totalNotConfirmedSize: 0
        }
      },
      {
        pole: 'pole-2',
        metrics: {
          totalConfirmedSize: 0,
          totalNotConfirmedSize: 1
        }
      },
    ])
  })
})