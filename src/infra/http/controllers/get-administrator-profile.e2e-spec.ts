import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'
import { transformDate } from '@/infra/utils/transform-date.ts'

describe('Get Administrator Profile (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('GET /administrators/profile', async () => {
    const administrator = await prisma.user.create(({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        birthday: transformDate('02/01/2006'),
        role: 'ADMIN'
      }
    }))

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: administrator.cpf,
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/administrators/profile`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body).toMatchObject({
      administrator: {
        username: administrator.username
      }
    })
  })
})