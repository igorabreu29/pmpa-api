import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { Discipline } from '@prisma/client'
import { makeAuth } from 'test/factories/make-auth.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'

describe('Update Discipline (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => app.close())

  it ('POST /disciplines', async () => {
    const { token } = await makeAuth()    

    const response = await request(app.server)
      .post('/disciplines')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'discipline-1'
      })

    expect(response.statusCode).toEqual(201)
  })
})