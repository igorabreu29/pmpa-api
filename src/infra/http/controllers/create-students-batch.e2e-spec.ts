import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'

describe('Create Students Batch (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('POST /students/batch', async () => {
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

    await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'node',
      }
    })

    await prisma.pole.create({
      data: {
        name: 'node-pole'
      }
    })

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-00',
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .post('/students/batch')
      .set('Authorization', `Bearer ${token}`)
      .type('multipart/form-data')
      .attach('excel', 'test/upload/students.xlsx')

    expect(response.statusCode).toEqual(201)
  })
})