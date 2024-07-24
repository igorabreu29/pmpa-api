import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'

describe('Students (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('POST /credentials/auth', async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'CAS',
      }
    })

    await prisma.pole.create({
      data: {
        name: 'pole-1'
      }
    })

    const data = {
      cpf: '05399970210',
      password: 'node-20'
    }

    const result = await request(app.server)
      .post('/credentials/auth')
      .send(data)
      .expect(201)

    const { token } = result.body

    expect(token).toEqual(expect.any(String))
  })
})