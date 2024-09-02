import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { beforeAll, describe, expect, it } from "vitest";

import request from 'supertest'
import bcrypt from 'bcryptjs'
import { User } from "@prisma/client";

let administrator: User

describe('Get Reports (e2e)', () => {
  beforeAll(async () => {
    administrator = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02346',
        cpf: '12345678911',
        email: 'july@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        role: 'ADMIN',
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/04/2001')
      }
    })

    await prisma.report.createMany({
      data: [
        {
          title: 'title-1',
          content: 'content-1',
          ip: '',
          reporterId: administrator.id,
        },
        {
          title: 'title-2',
          content: 'content-2',
          ip: '',
          reporterId: administrator.id,
        },
      ]
    })

    await app.ready()
  })

  it('GET /reports', async () => {
    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '123.456.789-11',
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get('/reports')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const { reports } = response.body

    expect(reports).toMatchObject([
      {
        title: 'title-1',
      },
      {
        title: 'title-2',
      }
    ])
  })
})