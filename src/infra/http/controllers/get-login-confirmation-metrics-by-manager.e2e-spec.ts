import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { Course, Pole } from '@prisma/client'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import bcrypt from 'bcryptjs'
import request from 'supertest'
import { transformDate } from '@/infra/utils/transform-date.ts'

let course: Course
let pole: Pole

describe('Get Login Confirmation Metrics By Manager (e2e)', () => {
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

    pole = await prisma.pole.create({
      data: {
        name: 'pole-1'
      }
    })

    await prisma.courseOnPole.create({
      data: {
        courseId: course.id,
        poleId: pole.id
      }
    })

    await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        isActive: true,
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
        isActive: true,
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

  it ('GET /courses/:id/manager/students/metrics', async () => {
    const manager = await prisma.user.create({
      data: {
        username: 'Jey Doe',
        civilId: '02345',
        cpf: '00000000001',
        email: 'jey@acne.com', 
        isActive: true,
        password: await bcrypt.hash('node-21', 8),
        role: 'MANAGER',
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
      .get(`/courses/${course.id}/manager/students/metrics`)
      .set('Authorization', `Bearer ${token}`)

    const { loginConfirmationMetrics } = response.body

    expect(response.statusCode).toEqual(200)
    expect(loginConfirmationMetrics).toMatchObject({
      pole: pole.name,
      poleId: pole.id,
      metrics: {
        totalConfirmedSize: 2,
        totalNotConfirmedSize: 0
      }
    })
  })
})