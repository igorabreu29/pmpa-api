import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import request from 'supertest'
import { transformDate } from '@/infra/utils/transform-date.ts'

let student: User

describe('Student Confirm Login And Update (e2e)', async () => {
  beforeAll(async () => {
    student = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        birthday: transformDate('01/02/2002'),
        role: 'STUDENT'
      }
    })

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('PATCH /students/:id/confirm', async () => {
    const authenticateResponse = await request(app.server)
    .post('/credentials/auth')
    .send({
      cpf: '000.000.000-00',
      password: 'node-20'
    })
    const { token } = authenticateResponse.body 

    const response = await request(app.server)
      .patch(`/students/confirm`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        motherName: 'mother-1',
        militaryId: '123456789'
      })

    expect(response.statusCode).toEqual(204)

    const profile = await prisma.profile.findUnique({
      where: {
        userId: student.id
      }
    })

    const expected = {
      motherName: 'mother-1',
      militaryId: '123456789'
    }

    expect(profile).toMatchObject(expected)
  })
})