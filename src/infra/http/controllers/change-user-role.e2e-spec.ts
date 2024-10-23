import { app } from '@/infra/app.ts'
import { redisConnection } from '@/infra/redis/connection.ts'
import { makePrismaStudent } from 'test/factories/make-student.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { User } from '@prisma/client'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { makeAuth } from 'test/factories/make-auth.ts'

let user: User

describe('Change User Role (e2e)', () => {
  beforeAll(async () => {
    await redisConnection.flushdb()

    user = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: '$2a$08$5gtlkFxleDEe1Xsft1HeVOwjXaq7428B46rjjIW7rLFqo1Xz2oWCW',
        role: 'MANAGER'
      }
    })

    await app.ready()
  })

  afterAll(async () => {
    redisConnection.disconnect()

    await app.close()
  })

  it ('PATCH /users/:id/role', async () => {
    const { token } = await makeAuth()

    const response = await request(app.server)
      .patch(`/users/${user.id}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'admin' })

      
    expect(response.statusCode).toBe(204)
  })
})