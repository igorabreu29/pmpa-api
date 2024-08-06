import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'

import bcrypt from 'bcryptjs'

describe('Change Developer Profile (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('PATCH /developers', async () => {
    const developer = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02346',
        cpf: '12345678911',
        email: 'july@acne.com', 
        isActive: true,
        password: await bcrypt.hash('node-20', 8),
        role: 'DEV',
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/04/2001')
      }
    })

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: developer.cpf,
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .patch(`/developers`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'Jenny Doe'
      })

    expect(response.statusCode).toEqual(204)

    const developerUpdated = await prisma.user.findUnique({
      where: {
        id: developer.id
      },

      select: {
        username: true
      }
    })

    expect(developerUpdated?.username).toEqual('Jenny Doe')
  })
})