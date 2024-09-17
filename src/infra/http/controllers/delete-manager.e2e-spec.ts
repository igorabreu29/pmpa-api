import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'
import { makeAuth } from 'test/factories/make-auth.ts'

describe('Delete Manager (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('DELETE /managers/:id', async () => {
    const data = {
      username: 'Jony',
      cpf: '00011100011',
      password: 'node-20',
      email: 'igor29nahan@gmail.com',
      birthday: '29/01/2006',
      civilId: '20234',
    }

    const manager = await prisma.user.create({
      data: {
        ...data,
        birthday: transformDate(data.birthday),
        role: 'MANAGER'
      }
    })

    const { token } = await makeAuth()

    const response = await request(app.server)
      .delete(`/managers/${manager.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(204)
  })
})