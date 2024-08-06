import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { beforeAll, describe, expect, it } from "vitest";

import request from 'supertest'
import bcrypt from 'bcryptjs'

describe('Get Poles (e2e)', () => {
  beforeAll(async () => {
    await prisma.pole.createMany({
      data: [
        {
          name: 'pole-1'
        },
        {
          name: 'pole-2'
        }
      ]
    })

    await app.ready()
  })

  it('GET /poles', async () => {
    const administrator = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02346',
        cpf: '12345678911',
        email: 'july@acne.com', 
        isActive: true,
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
      .get('/poles')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const { poles } = response.body
    
    expect(poles).toMatchObject([
      {
        name: 'pole-1',
      },
      {
        name: 'pole-2',
      }
    ])
  })
})