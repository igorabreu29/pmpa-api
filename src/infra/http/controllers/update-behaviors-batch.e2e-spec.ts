import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'

import bcrypt from 'bcryptjs'

describe('Update Behaviors Batch (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('PUT /behaviors/batch', async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    const administrator = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000011',
        email: 'john@acne.com', 
        password: '$2a$08$5gtlkFxleDEe1Xsft1HeVOwjXaq7428B46rjjIW7rLFqo1Xz2oWCW',
        role: 'ADMIN'
      }
    })
    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-11',
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'CAS',
      }
    })

    const [studentData, studentData2] = [
      {
        username: 'Igor',
        cpf: '00000000000',
        password: await bcrypt.hash('node-20', 8),
        email: 'igor29nahan@gmail.com',
        birthday: transformDate('29/01/2006'),
        civilId: '00000',
      },
      {
        username: 'John',
        cpf: '00000001111',
        password: await bcrypt.hash('node-21', 8),
        email: 'john@gmail.com',
        birthday: transformDate('29/01/2006'),
        civilId: '00000',
      },
    ]

    const student = await prisma.user.create({
      data: studentData
    })

    const student2 = await prisma.user.create({
      data: studentData2
    })

    await prisma.behavior.createMany({
      data: [
        {
          courseId: course.id,
          studentId: student.id,
          january: 6,
          february: 8,
          march: 5,
          currentYear: 2023,
          module: 1
        },
        {
          courseId: course.id,
          studentId: student2.id,
          january: 8,
          february: 9,
          march: 7,
          currentYear: 2023,
          module: 1
        }
      ]
    })

    const response = await request(app.server)
      .put(`/behaviors/batch?courseId=${course.id}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('excel', 'test/upload/behaviors.xlsx')

    expect(response.statusCode).toEqual(204)
  })
}) 