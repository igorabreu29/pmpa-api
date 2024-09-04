import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { Discipline } from '@prisma/client'
import { makeAuth } from 'test/factories/make-auth.ts'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'

let discipline: Discipline

describe('Delete Discipline (e2e)', () => {
  beforeAll(async () => {
    discipline = await prisma.discipline.create({
      data: {
        name: 'discipline-1'
      }
    })

    await app.ready()
  })

  afterAll(async () => app.close())

  it ('DELETE /disciplines/:id', async () => {
    const { token } = await makeAuth()    

    const response = await request(app.server)
      .delete(`/disciplines/${discipline.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(204)
  })
})