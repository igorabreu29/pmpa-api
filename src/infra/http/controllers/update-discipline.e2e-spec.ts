import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { Discipline } from '@prisma/client'
import { makeAuth } from 'test/factories/make-auth.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'

let discipline: Discipline

describe('Update Discipline (e2e)', () => {
  beforeAll(async () => {
    discipline = await prisma.discipline.create({
      data: {
        name: 'discipline-1'
      }
    })

    await app.ready()
  })

  afterAll(async () => app.close())

  it ('PUT /disciplines/:id', async () => {
    const { token } = await makeAuth()    

    const response = await request(app.server)
      .put(`/disciplines/${discipline.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'discipline-2'
      })

    expect(response.statusCode).toEqual(204)
  })
})