import { app } from '@/infra/app.ts'
import { prisma } from '@/infra/database/lib/prisma.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import bcrypt from 'bcryptjs'
import { transformDate } from '@/infra/utils/transform-date.ts'

describe('Get Manager Profile (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it ('GET /managers/profile', async () => {
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

    const pole = await prisma.pole.create({
      data: {
        name: 'pole-1'
      }
    })

    const manager = await prisma.user.create(({
      data: {
        username: 'John Doe',
        civilId: '02345',
        cpf: '00000000000',
        email: 'john@acne.com', 
        password: await bcrypt.hash('node-20', 8),
        birthday: transformDate('02/01/2006'),
        role: 'MANAGER'
      }
    }))

    const authenticateResponse = await request(app.server)
      .post('/credentials/auth')
      .send({
        cpf: '000.000.000-00',
        password: 'node-20'
      })
    const { token } = authenticateResponse.body

    const userOnCourse = await prisma.userOnCourse.create({
      data: {
        courseId: course.id,
        userId: manager.id
      }
    })

    await prisma.userCourseOnPole.create({
      data: {
        poleId: pole.id,
        userOnCourseId: userOnCourse.id
      }
    })

    const response = await request(app.server)
      .get(`/managers/profile`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body).toMatchObject({
      manager: {
        username: manager.username
      }
    })
  })
})