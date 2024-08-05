import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'

import bcrypt from 'bcryptjs'

describe('Update Assessment (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('PATCH /assessments/:id', async () => {
    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)

    const administrator = await prisma.user.create({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        isActive: true,
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

    const data = {
      username: 'Jony',
      cpf: '000.111.000-11',
      password: await bcrypt.hash('node-20', 8),
      email: 'igor29nahan@gmail.com',
      birthday: transformDate('29/01/2006'),
      civilId: '00000',
      isActive: true
    }

    const student = await prisma.user.create({
      data
    })

    const assessment = await prisma.assessment.create({
      data: {
        studentId: student.id,
        disciplineId: discipline.id,
        courseId: course.id,
        vf: 7
      }
    })

    const response = await request(app.server)
      .patch(`/assessments/${assessment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        vf: 10
      })

    expect(response.statusCode).toEqual(204)
  })
}) 