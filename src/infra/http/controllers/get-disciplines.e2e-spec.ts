import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { beforeAll, describe, expect, it } from "vitest";

import request from 'supertest'
import bcrypt from 'bcryptjs'

describe('Get Disciplines (e2e)', () => {
  beforeAll(async () => {
    await prisma.discipline.createMany({
      data: [
        {
          name: 'discipline-1'
        },
        {
          name: 'discipline-2'
        }
      ]
    })

    await app.ready()
  })

  it('GET /disciplines', async () => {
    const administrator = await prisma.user.create({
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

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: administrator.cpf,
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get('/disciplines')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const { disciplines } = response.body
    
    expect(disciplines).toMatchObject([
      {
        name: 'discipline-1',
      },
      {
        name: 'discipline-2',
      }
    ])
  })
})