import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'

describe('Create Course (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('POST /courses', async () => {
    const administrator = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        role: 'ADMIN'
      }
    })

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-00',
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const pole = await prisma.pole.create({
      data: {
          name: 'pole-1'
      },
    })

    const pole2 = await prisma.pole.create({
      data: {
        name: 'pole-2'
      }
    })

    const discipline = await prisma.discipline.create({
      data: {
        name: 'discipline-1'
      }
    })

    const discipline2 = await prisma.discipline.create({
      data: {
        name: 'discipline-2'
      }
    })

    const response = await request(app.server)
      .post('/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        formula: 'CGS',
        name: 'CGS TURMA I - 2022',
        imageUrl: 'http://localhost:3333',
        isPeriod: false,
        endsAt: '01/11/2050',
        poleIds: [pole.id, pole2.id],
        disciplines: [
          {
            id: discipline.id,
            expected: 'VF',
            hours: 30,
            module: 1
          },
          {
            id: discipline2.id,
            expected: 'VF',
            hours: 30,
            module: 1 
          }
        ]
      })

      expect(response.statusCode).toEqual(201)
  })
})