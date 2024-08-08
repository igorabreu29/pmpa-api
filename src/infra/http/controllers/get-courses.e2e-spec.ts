import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { beforeAll, describe, expect, it } from "vitest";

import request from 'supertest'
import bcrypt from 'bcryptjs'

describe('Get Courses (e2e)', () => {
  beforeAll(async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    await prisma.course.createMany({
      data: [
        {
          name: 'course-1',
          endsAt,
          formula: 'CAS',
          imageUrl: '',
        },
        {
          name: 'course-2',
          endsAt,
          formula: 'CGS',
          imageUrl: '',
        }
      ]
    })

    await app.ready()
  })

  it('GET /courses', async () => {
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
      .get('/courses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const { courses } = response.body
    
    expect(courses).toMatchObject([
      {
        name: 'course-1',
      },
      {
        name: 'course-2',
      }
    ])
  })
})