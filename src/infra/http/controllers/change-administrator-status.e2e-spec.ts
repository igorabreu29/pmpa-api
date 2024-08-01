import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'

import bcrypt from 'bcryptjs'

describe('Change Administrator Status (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('PATCH /administrators/:id/status', async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    const developer = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        isActive: true,
        password: await bcrypt.hash('node-20', 8),
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

    const administrator = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02346',
        cpf: '12345678911',
        email: 'july@acne.com', 
        isActive: true,
        password: '$2a$08$5gtlkFxleDEe1Xsft1HeVOwjXaq7428B46rjjIW7rLFqo1Xz2oWCW',
        role: 'ADMIN',
        birthday: transformDate('01/04/2001')
      }
    })

    const changeAdministratorStatusResponse = await request(app.server)
      .patch(`/administrators/${administrator.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: false
      })

    expect(changeAdministratorStatusResponse.statusCode).toEqual(204)

    const administratorUpdated = await prisma.user.findUnique({
      where: {
        id: administrator.id
      },

      select: {
        isActive: true
      }
    })

    expect(administratorUpdated?.isActive).toEqual(false)
  })
})