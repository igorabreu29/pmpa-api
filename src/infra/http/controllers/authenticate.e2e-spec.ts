import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'

describe('Authenticate (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('POST /credentials/auth', async () => {
    await prisma.user.create({
      data: {
        cpf: '00000000000',
        password: '$2a$08$grhz.fiRrbOMRnJ9Sb/lZOIGf4fmkcC9bZUUX3IDCTWxu9XA6WtKi',
        email: 'john@example.com',
        username: 'igor',
        role: 'DEV',
        civilId: '00009'
      }
    })

    const data = {
      cpf: '000.000.000-00',
      password: 'node-20'
    }

    const response = await request(app.server)
      .post('/credentials/auth')
      .send(data)

    const { token } = response.body

    expect(response.statusCode).toEqual(201)
    expect(token).toEqual(expect.any(String))
  })
})