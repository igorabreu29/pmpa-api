import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'

describe('Create Administrator (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('POST /administrators', async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    const developer = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: '$2a$08$5gtlkFxleDEe1Xsft1HeVOwjXaq7428B46rjjIW7rLFqo1Xz2oWCW',
        role: 'DEV'
      }
    })

    const data = {
      username: 'Jony',
      cpf: '000.111.000-11',
      password: 'node-20',
      email: 'igor29nahan@gmail.com',
      birthday: '29/01/2006',
      civilId: 0e5,
    }

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: developer.cpf,
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .post('/developers')
      .set('Authorization', `Bearer ${token}`)
      .send(data)

    expect(response.statusCode).toEqual(201)
  })
})