import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'
import { prisma } from '@/infra/database/lib/prisma.ts'
import type { Course, Pole } from '@prisma/client'
import { transformDate } from '@/infra/utils/transform-date.ts'

let course: Course
let pole: Pole

describe('Get Course Students By Manager (e2e)', () => {
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

  it ('GET /courses/:id/poles/:poleId/manager/students', async () => {
    await prisma.user.create({
      data: {
        username: 'Jey Doe',
        civilId: '02345',
        cpf: '00000000001',
        email: 'jey@acne.com', 
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
        cpf: '000.000.000-01',
        password: 'node-21'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/courses/${course.id}/poles/${pole.id}/manager/students`)
      .set('Authorization', `Bearer ${token}`)

    const { students } = response.body

    expect(response.statusCode).toEqual(200)
    expect(students).toMatchObject([
      {
        id: expect.any(String),
        pole: {
          id: pole.id
        } 
      },
      {
        id: expect.any(String),
        pole: {
          id: pole.id
        } 
      },
    ])
  })
})