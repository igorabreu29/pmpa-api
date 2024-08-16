import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'

import bcrypt from 'bcryptjs'

describe('Update Assessments Batch (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('PUT /assessments/batch', async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    const administrator = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: '$2a$08$5gtlkFxleDEe1Xsft1HeVOwjXaq7428B46rjjIW7rLFqo1Xz2oWCW',
        role: 'ADMIN'
      }
    })
    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: administrator.cpf,
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const course = await prisma.course.create({
      data: {
        endsAt,
        formula: 'CAS',
        imageUrl: '',
        name: 'CAS',
      }
    })

    const discipline = await prisma.discipline.create({
      data: {
        name: 'discipline-1'
      }
    })

    const [studentData, studentData2] = [
      {
        username: 'Igor',
        cpf: '58494203479',
        password: await bcrypt.hash('node-20', 8),
        email: 'igor29nahan@gmail.com',
        birthday: transformDate('29/01/2006'),
        civilId: '00000',
      },
      {
        username: 'John',
        cpf: '92518818049',
        password: await bcrypt.hash('node-21', 8),
        email: 'john@gmail.com',
        birthday: transformDate('29/01/2006'),
        civilId: '00000',
      },
    ]

    const student = await prisma.user.create({
      data: studentData
    })

    const student2 = await prisma.user.create({
      data: studentData2
    })

    await prisma.assessment.createMany({
      data: [
        {
          courseId: course.id,
          disciplineId: discipline.id,
          studentId: student.id,
          vf: 7,
          avi: 8
        },
        {
          courseId: course.id,
          disciplineId: discipline.id,
          studentId: student2.id,
          vf: 10,
          avi: 9
        }
      ]
    })

    const response = await request(app.server)
      .put(`/assessments/batch?courseId=${course.id}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('excel', 'test/upload/assessments.xlsx')

    expect(response.statusCode).toEqual(204)
  })
}) 