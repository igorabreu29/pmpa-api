import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'

describe('Create Course Discipline (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('POST /courses/:courseId/discipline', async () => {
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

    const endsAt = new Date()
    endsAt.setMinutes(new Date().getMinutes() + 10)
      
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
      },
    })

    const result = await request(app.server)
      .post(`/courses/${course.id}/discipline`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        disciplineId: discipline.id,
        expected: 'VF',
        hours: 30,
        module: 1
      })

      expect(result.statusCode).toEqual(201)
  })
})