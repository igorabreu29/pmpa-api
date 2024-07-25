import { app } from '@/infra/app.ts'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import request from 'supertest'
import { prisma } from '@/infra/database/lib/prisma.ts'

describe('Students (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  }) 

  afterAll(async () => {
    await app.close()
  }) 

  it ('POST /students', async () => {
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

    const data = {
      username: 'Igor',
      cpf: '05399970210',
      password: 'node-20',
      email: 'igor29nahan@gmail.com',
      birthday: '29/01/2006',
      civilId: 0e5,
      courseId: course.id,
      poleId: pole.id
    }

    const result = await request(app.server)
      .post('/students')
      .send(data)

    expect(result.statusCode).toEqual(201)
  })
})