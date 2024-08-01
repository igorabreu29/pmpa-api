import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'

describe('Delete Administrator (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('DELETE /administrators/:id', async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    const developer = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        isActive: true,
        password: '$2a$08$5gtlkFxleDEe1Xsft1HeVOwjXaq7428B46rjjIW7rLFqo1Xz2oWCW',
        role: 'DEV'
      }
    })

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: developer.cpf,
        password: 'node-20'
      })
    const { token } = authenticateResponse.body
    
    const data = {
      username: 'Jony',
      cpf: '00011100011',
      password: 'node-20',
      email: 'igor29nahan@gmail.com',
      birthday: '29/01/2006',
      civilId: '20234',
      isActive: true
    }

    const administrator = await prisma.user.create({
      data: {
        ...data,
        birthday: transformDate(data.birthday),
        role: 'ADMIN',
      }
    })

    const response = await request(app.server)
      .delete(`/administrators/${administrator.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(204)
  })
})