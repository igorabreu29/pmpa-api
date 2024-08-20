import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'

import bcrypt from 'bcryptjs'

describe('Change Manager Status (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('PATCH /courses/:courseId/managers/:id/status', async () => {
    const administrator = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        role: 'ADMIN'
      }
    })

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-00',
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    const course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'course'
      }
    })

    const pole = await prisma.pole.create({
      data: {
        name: 'pole'
      }
    })

    const manager = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02346',
        cpf: '12345678911',
        email: 'july@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        role: 'MANAGER',
        birthday: transformDate('01/04/2001'),

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

    const changeManagerStatusResponse = await request(app.server)
      .patch(`/courses/${course.id}/managers/${manager.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: false
      })

    expect(changeManagerStatusResponse.statusCode).toEqual(204)
  })
})