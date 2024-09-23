import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'

describe('Get Administrators (e2e)', () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        birthday: transformDate('01/02/2001'),
        role: 'ADMIN'
      },
    })

    await prisma.user.create({
      data: {
        username: 'Jonas Doe',
        civilId: '02345',
        cpf: '00000000011',
        email: 'jonas@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        birthday: transformDate('01/02/2001'),
        role: 'ADMIN',
      },
    })

    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('GET /administrators', async () => {
    await prisma.user.create({
      data: {
        username: 'Jey Doe',
        civilId: '02345',
        cpf: '00000000001',
        email: 'jey@acne.com', 
        password: await bcrypt.hash('node-21', 8),
        role: 'DEV'
      }
    })
    
    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-01',
        password: 'node-21'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/administrators?isEnabled=true`)
      .set('Authorization', `Bearer ${token}`)

    const { administrators, pages, totalItems } = response.body
    
    expect(response.statusCode).toEqual(200)
    expect(administrators).toMatchObject([
      {
        username: 'Jonas Doe'
      },
      {
        username: 'John Doe'
      }
    ])
    expect(pages).toEqual(1)
    expect(totalItems).toEqual(2)
  })
})