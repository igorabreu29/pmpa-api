import { app } from "@/infra/app.ts";
import { prisma } from "@/infra/database/lib/prisma.ts";
import { transformDate } from "@/infra/utils/transform-date.ts";
import { beforeAll, describe, expect, it } from "vitest";

import request from 'supertest'
import bcrypt from 'bcryptjs'
import { User, type Course } from "@prisma/client";

let course: Course

describe('Get Manager Reports (e2e)', () => {
  beforeAll(async () => {
    const manager = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02346',
        cpf: '12345678911',
        email: 'july@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        role: 'MANAGER',
        isLoginConfirmed: new Date(),
        birthday: transformDate('01/04/2001')
      }
    })

    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'CAS',
      }
    })

    await prisma.report.createMany({
      data: [
        {
          title: 'title-1',
          content: 'content-1',
          ip: '',
          courseId: course.id,
          reporterId: manager.id,
        },
        {
          title: 'title-2',
          content: 'content-2',
          ip: '',
          courseId: course.id,
          reporterId: manager.id,
        },
      ]
    })

    await app.ready()
  })

  it('GET /reports/:courseId/manager', async () => {
    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '123.456.789-11',
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const response = await request(app.server)
      .get(`/reports/${course.id}/manager`)
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