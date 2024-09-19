import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'

describe('Create Course (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('POST /courses', async () => {
    await prisma.user.create({
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

    const response = await request(app.server)
      .post('/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        formula: 'CGS',
        name: 'CGS TURMA I - 2022',
        imageUrl: 'http://localhost:3333',
        isPeriod: false,
        endsAt: '01/11/2050',
      })

      expect(response.statusCode).toEqual(201)
  })
})