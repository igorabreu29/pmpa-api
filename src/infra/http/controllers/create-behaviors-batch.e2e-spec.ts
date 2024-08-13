import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'

import bcrypt from 'bcryptjs'

describe('Create Behaviors Batch (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('POST /behaviors/batch', async () => {
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
        cpf: administrator.cpf,
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

    const data = [
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

    await prisma.user.createMany({
      data
    })

    const response = await request(app.server)
      .post(`/behaviors/batch?courseId=${course.id}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('excel', 'test/upload/behaviors.xlsx')

    expect(response.statusCode).toEqual(201)

    const behaviors = await prisma.behavior.findMany()
    
    expect(behaviors).toMatchObject([
      {
        courseId: course.id
      },
      {
        courseId: course.id
      }
    ])
  })
}) 