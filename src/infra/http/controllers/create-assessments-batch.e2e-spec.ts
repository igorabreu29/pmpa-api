import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { transformDate } from '@/infra/utils/transform-date.ts'

import bcrypt from 'bcryptjs'
import { DomainEvents } from '@/core/events/domain-events.ts'

DomainEvents.shouldRun = false

describe('Create Assessments Batch (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('POST /assessments/batch', async () => {
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
        cpf: '000.000.000-00',
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

    const data = [
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

    await prisma.user.createMany({
      data
    })

    const response = await request(app.server)
      .post(`/assessments/batch?courseId=${course.id}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('excel', 'test/upload/assessments.xlsx')

    expect(response.statusCode).toEqual(201)

    const assessments = await prisma.assessment.findMany()
    
    expect(assessments).toMatchObject([
      {
        disciplineId: discipline.id
      },
      {
        disciplineId: discipline.id
      }
    ])
  })
}) 